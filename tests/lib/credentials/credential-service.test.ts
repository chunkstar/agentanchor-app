/**
 * Credential Service Unit Tests
 * Epic 15: Portable Trust Credentials
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTrustTier,
  TRUST_TIERS,
  MIN_CREDENTIAL_TRUST_SCORE,
  CREDENTIAL_EXPIRY_HOURS,
  canRefreshCredential,
  decodeCredential,
  issueCredential,
  verifyCredential,
} from '@/lib/credentials/credential-service'

describe('Credential Service', () => {
  describe('getTrustTier', () => {
    it('returns UNTRUSTED for scores 0-99', () => {
      expect(getTrustTier(0)).toEqual(TRUST_TIERS.UNTRUSTED)
      expect(getTrustTier(50)).toEqual(TRUST_TIERS.UNTRUSTED)
      expect(getTrustTier(99)).toEqual(TRUST_TIERS.UNTRUSTED)
    })

    it('returns PROBATION for scores 100-249', () => {
      expect(getTrustTier(100)).toEqual(TRUST_TIERS.PROBATION)
      expect(getTrustTier(175)).toEqual(TRUST_TIERS.PROBATION)
      expect(getTrustTier(249)).toEqual(TRUST_TIERS.PROBATION)
    })

    it('returns DEVELOPING for scores 250-499', () => {
      expect(getTrustTier(250)).toEqual(TRUST_TIERS.DEVELOPING)
      expect(getTrustTier(375)).toEqual(TRUST_TIERS.DEVELOPING)
      expect(getTrustTier(499)).toEqual(TRUST_TIERS.DEVELOPING)
    })

    it('returns ESTABLISHED for scores 500-749', () => {
      expect(getTrustTier(500)).toEqual(TRUST_TIERS.ESTABLISHED)
      expect(getTrustTier(625)).toEqual(TRUST_TIERS.ESTABLISHED)
      expect(getTrustTier(749)).toEqual(TRUST_TIERS.ESTABLISHED)
    })

    it('returns TRUSTED for scores 750-899', () => {
      expect(getTrustTier(750)).toEqual(TRUST_TIERS.TRUSTED)
      expect(getTrustTier(825)).toEqual(TRUST_TIERS.TRUSTED)
      expect(getTrustTier(899)).toEqual(TRUST_TIERS.TRUSTED)
    })

    it('returns LEGENDARY for scores 900-1000', () => {
      expect(getTrustTier(900)).toEqual(TRUST_TIERS.LEGENDARY)
      expect(getTrustTier(950)).toEqual(TRUST_TIERS.LEGENDARY)
      expect(getTrustTier(1000)).toEqual(TRUST_TIERS.LEGENDARY)
    })
  })

  describe('Constants', () => {
    it('has correct minimum credential trust score (FR157)', () => {
      expect(MIN_CREDENTIAL_TRUST_SCORE).toBe(250)
    })

    it('has correct credential expiry hours (FR159)', () => {
      expect(CREDENTIAL_EXPIRY_HOURS).toBe(24)
    })
  })

  describe('canRefreshCredential', () => {
    it('returns true when within 6 hours of expiry', () => {
      const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000) // 5 hours from now
      expect(canRefreshCredential(expiresAt)).toBe(true)
    })

    it('returns true when within 1 hour of expiry', () => {
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
      expect(canRefreshCredential(expiresAt)).toBe(true)
    })

    it('returns false when more than 6 hours until expiry', () => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 60 * 1000) // 10 hours from now
      expect(canRefreshCredential(expiresAt)).toBe(false)
    })

    it('returns false when already expired', () => {
      const expiresAt = new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      expect(canRefreshCredential(expiresAt)).toBe(false)
    })
  })

  describe('issueCredential', () => {
    beforeEach(() => {
      // Reset environment for development mode key generation
      process.env.NODE_ENV = 'development'
    })

    it('throws error if trust score below minimum (FR157)', async () => {
      await expect(
        issueCredential({
          agentId: 'test-agent',
          trainerId: 'test-trainer',
          trustScore: 200, // Below 250 minimum
        })
      ).rejects.toThrow('Agent does not meet minimum trust score requirement')
    })

    it('issues credential for eligible agent', async () => {
      const result = await issueCredential({
        agentId: 'test-agent',
        trainerId: 'test-trainer',
        trustScore: 300,
      })

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('jwtId')
      expect(result).toHaveProperty('issuedAt')
      expect(result).toHaveProperty('expiresAt')
      expect(result.jwtId).toMatch(/^ptc_/)
    })

    it('includes correct trust tier in payload', async () => {
      const result = await issueCredential({
        agentId: 'test-agent',
        trainerId: 'test-trainer',
        trustScore: 500,
      })

      expect(result.payload.trust.tier).toBe('Established')
      expect(result.payload.trust.tier_code).toBe(3)
    })

    it('sets correct expiry time (24 hours)', async () => {
      const before = Date.now()
      const result = await issueCredential({
        agentId: 'test-agent',
        trainerId: 'test-trainer',
        trustScore: 300,
      })
      const after = Date.now()

      const expectedExpiry = before + CREDENTIAL_EXPIRY_HOURS * 60 * 60 * 1000
      const actualExpiry = result.expiresAt.getTime()

      // Allow 1 second tolerance
      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 1000)
      expect(actualExpiry).toBeLessThanOrEqual(after + CREDENTIAL_EXPIRY_HOURS * 60 * 60 * 1000)
    })

    it('includes governance summary in payload', async () => {
      const result = await issueCredential({
        agentId: 'test-agent',
        trainerId: 'test-trainer',
        trustScore: 300,
        governanceSummary: {
          totalDecisions: 10,
          approvalRate: 0.9,
          escalationRate: 0.1,
        },
      })

      expect(result.payload.governance.total_decisions).toBe(10)
      expect(result.payload.governance.approval_rate).toBe(0.9)
    })

    it('includes certification data in payload', async () => {
      const result = await issueCredential({
        agentId: 'test-agent',
        trainerId: 'test-trainer',
        trustScore: 300,
        certificationData: {
          academyGraduated: true,
          specializations: ['finance', 'customer-support'],
          mentorCertified: false,
        },
      })

      expect(result.payload.certification.academy_graduated).toBe(true)
      expect(result.payload.certification.specializations).toContain('finance')
    })

    it('includes truth chain anchor in payload', async () => {
      const result = await issueCredential({
        agentId: 'test-agent',
        trainerId: 'test-trainer',
        trustScore: 300,
        truthChainHash: 'abc123',
        truthChainBlockHeight: 42,
      })

      expect(result.payload.provenance.truth_chain_hash).toBe('abc123')
      expect(result.payload.provenance.block_height).toBe(42)
    })
  })

  describe('verifyCredential', () => {
    let validToken: string

    beforeEach(async () => {
      process.env.NODE_ENV = 'development'
      const credential = await issueCredential({
        agentId: 'verify-test-agent',
        trainerId: 'verify-test-trainer',
        trustScore: 400,
      })
      validToken = credential.token
    })

    it('verifies valid credential', async () => {
      const result = await verifyCredential(validToken)

      expect(result.valid).toBe(true)
      expect(result.agentId).toBe('verify-test-agent')
      expect(result.trustScore).toBe(400)
      expect(result.trustTier).toBe('Developing')
    })

    it('returns invalid for malformed token', async () => {
      const result = await verifyCredential('not-a-valid-jwt')

      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('malformed')
    })

    it('checks revocation when callback provided', async () => {
      const result = await verifyCredential(validToken, {
        checkRevocation: async (jwtId) => true, // Always revoked
      })

      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('revoked')
    })

    it('passes when not revoked', async () => {
      const result = await verifyCredential(validToken, {
        checkRevocation: async (jwtId) => false, // Not revoked
      })

      expect(result.valid).toBe(true)
    })

    it('adds warning when trust score is stale', async () => {
      const result = await verifyCredential(validToken, {
        getCurrentTrustScore: async (agentId) => 300, // Different by more than 50
      })

      expect(result.valid).toBe(true)
      expect(result.warnings).toContain('trust_score_stale')
    })

    it('returns invalid when current trust score drops below minimum', async () => {
      const result = await verifyCredential(validToken, {
        getCurrentTrustScore: async (agentId) => 200, // Below 250 minimum
      })

      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('trust_score_ineligible')
    })

    it('includes expiry information', async () => {
      const result = await verifyCredential(validToken)

      expect(result.valid).toBe(true)
      expect(result.expiresIn).toBeGreaterThan(0)
      expect(result.expiresIn).toBeLessThanOrEqual(CREDENTIAL_EXPIRY_HOURS * 60 * 60)
    })
  })

  describe('decodeCredential', () => {
    it('decodes valid credential without verification', async () => {
      process.env.NODE_ENV = 'development'
      const credential = await issueCredential({
        agentId: 'decode-test-agent',
        trainerId: 'decode-test-trainer',
        trustScore: 500,
      })

      const payload = decodeCredential(credential.token)

      expect(payload).not.toBeNull()
      expect(payload?.sub).toBe('decode-test-agent')
      expect(payload?.trust.score).toBe(500)
    })

    it('returns null for invalid token', () => {
      const payload = decodeCredential('invalid-token')
      expect(payload).toBeNull()
    })
  })
})
