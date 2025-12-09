/**
 * Portable Trust Credential Service
 * FR157-162: Issue, verify, and revoke portable trust credentials
 *
 * Implementation: Epic 15 - Portable Trust Credentials (MOAT BUILDER)
 */

import { SignJWT, jwtVerify, decodeJwt, decodeProtectedHeader, importPKCS8, importSPKI, generateKeyPair, errors } from 'jose'
import type { JWTPayload } from 'jose'
import { randomUUID } from 'crypto'

// Trust tier definitions (matching Architecture v3.0)
export const TRUST_TIERS = {
  UNTRUSTED: { code: 0, name: 'Untrusted', min: 0, max: 99, color: 'red' },
  PROBATION: { code: 1, name: 'Probation', min: 100, max: 249, color: 'orange' },
  DEVELOPING: { code: 2, name: 'Developing', min: 250, max: 499, color: 'yellow' },
  ESTABLISHED: { code: 3, name: 'Established', min: 500, max: 749, color: 'blue' },
  TRUSTED: { code: 4, name: 'Trusted', min: 750, max: 899, color: 'emerald' },
  LEGENDARY: { code: 5, name: 'Legendary', min: 900, max: 1000, color: 'gold' },
} as const

export type TrustTierName = keyof typeof TRUST_TIERS

// Minimum trust score required for credential issuance (FR157)
export const MIN_CREDENTIAL_TRUST_SCORE = 250

// Credential expiry duration (FR159: 24 hours)
export const CREDENTIAL_EXPIRY_HOURS = 24

// Refresh window (can refresh if within 6 hours of expiry)
export const CREDENTIAL_REFRESH_WINDOW_HOURS = 6

/**
 * Get trust tier from score
 */
export function getTrustTier(score: number): { code: number; name: string; color: string } {
  if (score >= 900) return TRUST_TIERS.LEGENDARY
  if (score >= 750) return TRUST_TIERS.TRUSTED
  if (score >= 500) return TRUST_TIERS.ESTABLISHED
  if (score >= 250) return TRUST_TIERS.DEVELOPING
  if (score >= 100) return TRUST_TIERS.PROBATION
  return TRUST_TIERS.UNTRUSTED
}

/**
 * Portable Trust Credential payload (JWT claims)
 */
export interface PTCPayload {
  // Standard JWT claims
  iss: string // Issuer: https://agentanchorai.com
  sub: string // Subject: agent ID
  iat: number // Issued at
  exp: number // Expiration
  nbf: number // Not before
  jti: string // JWT ID for revocation tracking

  // Trust data
  trust: {
    score: number
    tier: string
    tier_code: number
    percentile?: number
  }

  // Governance summary
  governance: {
    total_decisions: number
    approval_rate: number
    escalation_rate: number
    last_council_review?: string
  }

  // Certification data
  certification: {
    academy_graduated: boolean
    graduation_date?: string
    specializations: string[]
    mentor_certified: boolean
  }

  // Provenance (Truth Chain anchor)
  provenance: {
    truth_chain_hash?: string
    block_height?: number
    trainer_id: string
  }
}

/**
 * Credential issuance request
 */
export interface IssueCredentialRequest {
  agentId: string
  trainerId: string
  trustScore: number
  governanceSummary?: {
    totalDecisions: number
    approvalRate: number
    escalationRate: number
    lastCouncilReview?: string
  }
  certificationData?: {
    academyGraduated: boolean
    graduationDate?: string
    specializations: string[]
    mentorCertified: boolean
  }
  truthChainHash?: string
  truthChainBlockHeight?: number
}

/**
 * Credential issuance result
 */
export interface IssuedCredential {
  token: string
  jwtId: string
  issuedAt: Date
  expiresAt: Date
  payload: PTCPayload
}

/**
 * Verification result
 */
export interface VerificationResult {
  valid: boolean
  agentId?: string
  trustScore?: number
  trustTier?: string
  expiresIn?: number
  truthChainVerified?: boolean
  warnings: string[]
  error?: string
  errorCode?: 'expired' | 'revoked' | 'invalid_signature' | 'malformed' | 'trust_score_ineligible'
}

/**
 * Get the current signing key ID
 */
export function getCurrentKeyId(): string {
  const year = new Date().getFullYear()
  return `aa_key_${year}_001`
}

// Cache for development key pair
let devKeyPair: { privateKey: CryptoKey; publicKey: CryptoKey } | null = null

/**
 * Get the private key for signing (from environment)
 */
async function getPrivateKey(): Promise<CryptoKey> {
  const privateKeyPem = process.env.CREDENTIAL_SIGNING_PRIVATE_KEY

  if (!privateKeyPem) {
    // In development, generate and cache a temporary key pair
    if (process.env.NODE_ENV === 'development') {
      if (!devKeyPair) {
        devKeyPair = await generateKeyPair('ES256')
      }
      return devKeyPair.privateKey
    }
    throw new Error('CREDENTIAL_SIGNING_PRIVATE_KEY not configured')
  }

  return importPKCS8(privateKeyPem, 'ES256')
}

/**
 * Get the public key for verification
 */
async function getPublicKey(keyId?: string): Promise<CryptoKey> {
  const publicKeyPem = process.env.CREDENTIAL_SIGNING_PUBLIC_KEY

  if (!publicKeyPem) {
    // In development, use the cached key pair
    if (process.env.NODE_ENV === 'development') {
      if (!devKeyPair) {
        devKeyPair = await generateKeyPair('ES256')
      }
      return devKeyPair.publicKey
    }
    throw new Error('CREDENTIAL_SIGNING_PUBLIC_KEY not configured')
  }

  return importSPKI(publicKeyPem, 'ES256')
}

/**
 * Issue a Portable Trust Credential (FR157-159)
 *
 * @param request - The credential issuance request
 * @returns The issued credential with JWT token
 * @throws Error if agent doesn't meet eligibility requirements
 */
export async function issueCredential(request: IssueCredentialRequest): Promise<IssuedCredential> {
  // Validate eligibility (FR157: Trust Score 250+)
  if (request.trustScore < MIN_CREDENTIAL_TRUST_SCORE) {
    throw new Error(
      `Agent does not meet minimum trust score requirement. Required: ${MIN_CREDENTIAL_TRUST_SCORE}, Current: ${request.trustScore}`
    )
  }

  const tier = getTrustTier(request.trustScore)
  const jwtId = `ptc_${randomUUID().replace(/-/g, '').slice(0, 16)}`
  const now = Math.floor(Date.now() / 1000)
  const issuedAt = new Date()
  const expiresAt = new Date(Date.now() + CREDENTIAL_EXPIRY_HOURS * 60 * 60 * 1000)

  // Build payload (FR158)
  const payload: PTCPayload = {
    iss: 'https://agentanchorai.com',
    sub: request.agentId,
    iat: now,
    exp: Math.floor(expiresAt.getTime() / 1000),
    nbf: now,
    jti: jwtId,

    trust: {
      score: request.trustScore,
      tier: tier.name,
      tier_code: tier.code,
    },

    governance: {
      total_decisions: request.governanceSummary?.totalDecisions ?? 0,
      approval_rate: request.governanceSummary?.approvalRate ?? 0,
      escalation_rate: request.governanceSummary?.escalationRate ?? 0,
      last_council_review: request.governanceSummary?.lastCouncilReview,
    },

    certification: {
      academy_graduated: request.certificationData?.academyGraduated ?? false,
      graduation_date: request.certificationData?.graduationDate,
      specializations: request.certificationData?.specializations ?? [],
      mentor_certified: request.certificationData?.mentorCertified ?? false,
    },

    provenance: {
      truth_chain_hash: request.truthChainHash,
      block_height: request.truthChainBlockHeight,
      trainer_id: request.trainerId,
    },
  }

  // Sign the credential (FR159: ES256)
  const privateKey = await getPrivateKey()
  const keyId = getCurrentKeyId()

  const token = await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({
      alg: 'ES256',
      typ: 'PTC',
      kid: keyId,
    })
    .sign(privateKey)

  return {
    token,
    jwtId,
    issuedAt,
    expiresAt,
    payload,
  }
}

/**
 * Verify a Portable Trust Credential (FR160-161)
 *
 * @param token - The JWT token to verify
 * @param options - Verification options
 * @returns Verification result with validity status and details
 */
export async function verifyCredential(
  token: string,
  options?: {
    checkRevocation?: (jwtId: string) => Promise<boolean>
    getCurrentTrustScore?: (agentId: string) => Promise<number | null>
  }
): Promise<VerificationResult> {
  const warnings: string[] = []

  try {
    // Decode header to get key ID
    const protectedHeader = decodeProtectedHeader(token)
    const keyId = protectedHeader.kid

    // Get public key for verification
    const publicKey = await getPublicKey(keyId)

    // Verify signature and decode
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: 'https://agentanchorai.com',
      typ: 'PTC',
    })

    const ptcPayload = payload as unknown as PTCPayload

    // Check revocation if callback provided
    if (options?.checkRevocation) {
      const isRevoked = await options.checkRevocation(ptcPayload.jti)
      if (isRevoked) {
        return {
          valid: false,
          error: 'Credential has been revoked',
          errorCode: 'revoked',
          warnings,
        }
      }
    }

    // Check current trust score if callback provided (FR161: check current trust state)
    if (options?.getCurrentTrustScore) {
      const currentScore = await options.getCurrentTrustScore(ptcPayload.sub)
      if (currentScore !== null) {
        const scoreDiff = Math.abs(currentScore - ptcPayload.trust.score)
        if (scoreDiff > 50) {
          warnings.push('trust_score_stale')
        }
        // Check if agent still qualifies
        if (currentScore < MIN_CREDENTIAL_TRUST_SCORE) {
          return {
            valid: false,
            error: 'Agent no longer meets minimum trust score requirement',
            errorCode: 'trust_score_ineligible',
            warnings,
          }
        }
      }
    }

    // Calculate time until expiry
    const expiresIn = ptcPayload.exp - Math.floor(Date.now() / 1000)

    return {
      valid: true,
      agentId: ptcPayload.sub,
      trustScore: ptcPayload.trust.score,
      trustTier: ptcPayload.trust.tier,
      expiresIn,
      truthChainVerified: !!ptcPayload.provenance.truth_chain_hash,
      warnings,
    }
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      return {
        valid: false,
        error: 'Credential has expired',
        errorCode: 'expired',
        warnings,
      }
    }
    if (error instanceof errors.JWSSignatureVerificationFailed) {
      return {
        valid: false,
        error: 'Invalid signature',
        errorCode: 'invalid_signature',
        warnings,
      }
    }
    return {
      valid: false,
      error: 'Malformed credential',
      errorCode: 'malformed',
      warnings,
    }
  }
}

/**
 * Check if a credential can be refreshed
 */
export function canRefreshCredential(expiresAt: Date): boolean {
  const hoursUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntilExpiry <= CREDENTIAL_REFRESH_WINDOW_HOURS && hoursUntilExpiry > 0
}

/**
 * Decode a credential without verification (for display purposes)
 */
export function decodeCredential(token: string): PTCPayload | null {
  try {
    const payload = decodeJwt(token)
    return payload as unknown as PTCPayload
  } catch {
    return null
  }
}

// ============================================================================
// STORY 15-4: Credential Refresh (Auto-refresh before expiry)
// ============================================================================

/**
 * Refresh request with current agent data
 */
export interface RefreshCredentialRequest {
  existingToken: string
  currentTrustScore: number
  trainerId: string
  governanceSummary?: {
    totalDecisions: number
    approvalRate: number
    escalationRate: number
    lastCouncilReview?: string
  }
  certificationData?: {
    academyGraduated: boolean
    graduationDate?: string
    specializations: string[]
    mentorCertified: boolean
  }
  truthChainHash?: string
  truthChainBlockHeight?: number
}

/**
 * Refresh result with new credential and metadata
 */
export interface RefreshResult {
  success: boolean
  credential?: IssuedCredential
  parentJwtId?: string
  error?: string
  errorCode?: 'not_refreshable' | 'expired' | 'revoked' | 'ineligible' | 'invalid'
}

/**
 * Refresh an existing credential before it expires (FR160)
 *
 * @param request - The refresh request with existing token and current agent data
 * @param options - Optional callbacks for revocation checking
 * @returns Refresh result with new credential or error
 */
export async function refreshCredential(
  request: RefreshCredentialRequest,
  options?: {
    checkRevocation?: (jwtId: string) => Promise<boolean>
  }
): Promise<RefreshResult> {
  try {
    // Decode the existing token (don't verify expiry yet)
    const decoded = decodeCredential(request.existingToken)
    if (!decoded) {
      return {
        success: false,
        error: 'Invalid credential format',
        errorCode: 'invalid',
      }
    }

    // Check if revoked
    if (options?.checkRevocation) {
      const isRevoked = await options.checkRevocation(decoded.jti)
      if (isRevoked) {
        return {
          success: false,
          error: 'Credential has been revoked',
          errorCode: 'revoked',
        }
      }
    }

    // Check expiry status
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = new Date(decoded.exp * 1000)

    // Allow refresh if within window OR if just expired (grace period of 1 hour)
    const hoursSinceExpiry = (now - decoded.exp) / 3600
    const hoursUntilExpiry = (decoded.exp - now) / 3600

    if (hoursSinceExpiry > 1) {
      // Expired more than 1 hour ago
      return {
        success: false,
        error: 'Credential has expired beyond refresh grace period',
        errorCode: 'expired',
      }
    }

    if (hoursUntilExpiry > CREDENTIAL_REFRESH_WINDOW_HOURS) {
      return {
        success: false,
        error: `Credential can only be refreshed within ${CREDENTIAL_REFRESH_WINDOW_HOURS} hours of expiry`,
        errorCode: 'not_refreshable',
      }
    }

    // Check eligibility with current trust score
    if (request.currentTrustScore < MIN_CREDENTIAL_TRUST_SCORE) {
      return {
        success: false,
        error: `Agent no longer meets minimum trust score requirement. Required: ${MIN_CREDENTIAL_TRUST_SCORE}, Current: ${request.currentTrustScore}`,
        errorCode: 'ineligible',
      }
    }

    // Issue new credential with updated data
    const newCredential = await issueCredential({
      agentId: decoded.sub,
      trainerId: request.trainerId,
      trustScore: request.currentTrustScore,
      governanceSummary: request.governanceSummary,
      certificationData: request.certificationData,
      truthChainHash: request.truthChainHash,
      truthChainBlockHeight: request.truthChainBlockHeight,
    })

    return {
      success: true,
      credential: newCredential,
      parentJwtId: decoded.jti,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'invalid',
    }
  }
}

/**
 * Get credentials that need refresh (within refresh window)
 * Useful for background refresh jobs
 */
export function getRefreshWindowEndTime(expiresAt: Date): Date {
  return new Date(expiresAt.getTime() - CREDENTIAL_REFRESH_WINDOW_HOURS * 60 * 60 * 1000)
}

// ============================================================================
// STORY 15-5: Revocation System (Instant invalidation)
// ============================================================================

/**
 * Revocation reasons
 */
export type RevocationReason =
  | 'trust_score_dropped'
  | 'agent_paused'
  | 'agent_terminated'
  | 'security_incident'
  | 'trainer_request'
  | 'council_decision'
  | 'platform_action'
  | 'other'

/**
 * Revocation request
 */
export interface RevokeCredentialRequest {
  jwtId: string
  agentId: string
  reason: RevocationReason
  revokedBy: string
  notes?: string
}

/**
 * Revocation result
 */
export interface RevocationResult {
  success: boolean
  jwtId: string
  revokedAt?: Date
  error?: string
}

/**
 * In-memory revocation cache for fast checking
 * In production, this should be backed by Redis or similar
 */
const revocationCache = new Map<string, { revokedAt: Date; reason: RevocationReason }>()

/**
 * Add a credential to the revocation list
 */
export function addToRevocationCache(
  jwtId: string,
  reason: RevocationReason,
  revokedAt: Date = new Date()
): void {
  revocationCache.set(jwtId, { revokedAt, reason })
}

/**
 * Check if a credential is revoked (from cache)
 */
export function isRevokedInCache(jwtId: string): boolean {
  return revocationCache.has(jwtId)
}

/**
 * Get revocation details from cache
 */
export function getRevocationDetails(jwtId: string): { revokedAt: Date; reason: RevocationReason } | null {
  return revocationCache.get(jwtId) || null
}

/**
 * Clear revocation cache (for testing)
 */
export function clearRevocationCache(): void {
  revocationCache.clear()
}

/**
 * Batch revoke all credentials for an agent
 * Called when agent is paused, terminated, or trust score drops below threshold
 */
export async function revokeAllAgentCredentials(
  agentId: string,
  reason: RevocationReason,
  revokedBy: string,
  getActiveCredentials: (agentId: string) => Promise<Array<{ jwtId: string }>>
): Promise<{ revokedCount: number; jwtIds: string[] }> {
  const credentials = await getActiveCredentials(agentId)
  const jwtIds: string[] = []

  for (const cred of credentials) {
    addToRevocationCache(cred.jwtId, reason)
    jwtIds.push(cred.jwtId)
  }

  return {
    revokedCount: jwtIds.length,
    jwtIds,
  }
}

/**
 * Check revocation with database fallback
 * First checks cache, then database if cache miss
 */
export async function checkRevocation(
  jwtId: string,
  dbCheck?: (jwtId: string) => Promise<boolean>
): Promise<boolean> {
  // Check cache first
  if (isRevokedInCache(jwtId)) {
    return true
  }

  // Fall back to database check
  if (dbCheck) {
    const isRevoked = await dbCheck(jwtId)
    if (isRevoked) {
      // Populate cache for future checks
      addToRevocationCache(jwtId, 'other')
      return true
    }
  }

  return false
}
