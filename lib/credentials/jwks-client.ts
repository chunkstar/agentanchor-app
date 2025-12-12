/**
 * JWKS Client Utility
 *
 * Fetches and caches public keys from AgentAnchor's JWKS endpoint
 * for credential verification by external systems.
 */

import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import type { PTCPayload, VerificationResult } from './credential-service';

// Default JWKS endpoint
const DEFAULT_JWKS_URL = 'https://app.agentanchorai.com/.well-known/jwks.json';

// Cached remote JWK Set
let cachedJwkSet: ReturnType<typeof createRemoteJWKSet> | null = null;
let cachedJwkSetUrl: string | null = null;

/**
 * Get or create the remote JWK Set for verification
 */
export function getRemoteJwkSet(jwksUrl: string = DEFAULT_JWKS_URL): ReturnType<typeof createRemoteJWKSet> {
  // Return cached if same URL
  if (cachedJwkSet && cachedJwkSetUrl === jwksUrl) {
    return cachedJwkSet;
  }

  // Create new remote JWK Set with caching
  cachedJwkSet = createRemoteJWKSet(new URL(jwksUrl), {
    cooldownDuration: 30000,      // Min time between refetches: 30 seconds
    timeoutDuration: 5000,        // Request timeout: 5 seconds
    cacheMaxAge: 300000,          // Cache keys for 5 minutes
  });
  cachedJwkSetUrl = jwksUrl;

  return cachedJwkSet;
}

/**
 * Verify a Portable Trust Credential using remote JWKS
 *
 * This is the recommended method for external systems to verify
 * AgentAnchor-issued credentials.
 *
 * @param token - The JWT token to verify
 * @param jwksUrl - Optional custom JWKS URL (defaults to production)
 * @returns Verification result
 *
 * @example
 * ```typescript
 * import { verifyCredentialRemote } from '@agentanchor/credentials';
 *
 * const result = await verifyCredentialRemote(token);
 * if (result.valid) {
 *   console.log(`Agent ${result.agentId} has trust score ${result.trustScore}`);
 * }
 * ```
 */
export async function verifyCredentialRemote(
  token: string,
  jwksUrl: string = DEFAULT_JWKS_URL
): Promise<VerificationResult> {
  const warnings: string[] = [];

  try {
    const jwkSet = getRemoteJwkSet(jwksUrl);

    // Verify the token
    const { payload } = await jwtVerify(token, jwkSet, {
      issuer: 'https://agentanchorai.com',
      typ: 'PTC',
    });

    const ptcPayload = payload as unknown as PTCPayload;

    // Calculate time until expiry
    const expiresIn = ptcPayload.exp - Math.floor(Date.now() / 1000);

    return {
      valid: true,
      agentId: ptcPayload.sub,
      trustScore: ptcPayload.trust.score,
      trustTier: ptcPayload.trust.tier,
      expiresIn,
      truthChainVerified: !!ptcPayload.provenance.truth_chain_hash,
      warnings,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return {
          valid: false,
          error: 'Credential has expired',
          errorCode: 'expired',
          warnings,
        };
      }
      if (error.message.includes('signature')) {
        return {
          valid: false,
          error: 'Invalid signature',
          errorCode: 'invalid_signature',
          warnings,
        };
      }
    }
    return {
      valid: false,
      error: 'Malformed credential',
      errorCode: 'malformed',
      warnings,
    };
  }
}

/**
 * Clear the cached JWK Set (useful for testing or key rotation)
 */
export function clearJwkSetCache(): void {
  cachedJwkSet = null;
  cachedJwkSetUrl = null;
}

/**
 * Fetch JWKS manually (for inspection/debugging)
 */
export async function fetchJwks(jwksUrl: string = DEFAULT_JWKS_URL): Promise<{ keys: JsonWebKey[] }> {
  const response = await fetch(jwksUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
