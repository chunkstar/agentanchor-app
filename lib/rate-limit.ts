/**
 * Rate Limiting System
 *
 * Implements rate limiting using Upstash Redis to prevent API abuse
 * and control costs. Supports different limits for different endpoints.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { config } from './config'
import { RateLimitError } from './errors'
import { logger } from './logger'
import { trackRateLimit } from './metrics'

/**
 * Initialize Redis client
 */
let redis: Redis | null = null

function getRedisClient(): Redis {
  if (!config.rateLimit.redis) {
    throw new Error('Redis configuration not found for rate limiting')
  }

  if (!redis) {
    redis = new Redis({
      url: config.rateLimit.redis.url,
      token: config.rateLimit.redis.token,
    })
  }

  return redis
}

/**
 * Rate limiter instances for different endpoints
 */
export const chatRateLimit = config.rateLimit.enabled && config.rateLimit.redis
  ? new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
      analytics: true,
      prefix: 'ratelimit:chat',
    })
  : null

export const botCreationRateLimit = config.rateLimit.enabled && config.rateLimit.redis
  ? new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 bot creations per hour
      analytics: true,
      prefix: 'ratelimit:bot-creation',
    })
  : null

export const orchestratorRateLimit = config.rateLimit.enabled && config.rateLimit.redis
  ? new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
      analytics: true,
      prefix: 'ratelimit:orchestrator',
    })
  : null

export const globalRateLimit = config.rateLimit.enabled && config.rateLimit.redis
  ? new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute overall
      analytics: true,
      prefix: 'ratelimit:global',
    })
  : null

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending?: Promise<unknown>
}

/**
 * Check rate limit for a user
 */
export async function checkRateLimit(
  userId: string,
  limiter: Ratelimit | null,
  endpoint: string
): Promise<RateLimitResult> {
  if (!limiter || !config.rateLimit.enabled) {
    // Rate limiting disabled
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }

  try {
    const result = await limiter.limit(userId)

    if (!result.success) {
      logger.warn({
        type: 'rate_limit',
        userId,
        endpoint,
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      })

      trackRateLimit(userId, endpoint, result.limit)
    }

    return result
  } catch (error) {
    logger.error({
      type: 'rate_limit_error',
      error: error instanceof Error ? error.message : String(error),
      userId,
      endpoint,
    })

    // Fail open - allow request if rate limiter is down
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }
}

/**
 * Middleware to enforce rate limiting
 */
export async function enforceRateLimit(
  userId: string,
  limiter: Ratelimit | null,
  endpoint: string
): Promise<void> {
  const result = await checkRateLimit(userId, limiter, endpoint)

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      retryAfter
    )
  }
}

/**
 * Rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers)

  Object.entries(getRateLimitHeaders(result)).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Get rate limit stats for a user
 */
export async function getRateLimitStats(userId: string) {
  if (!config.rateLimit.redis) {
    return {
      enabled: false,
      stats: {},
    }
  }

  const client = getRedisClient()
  const prefixes = ['chat', 'bot-creation', 'orchestrator', 'global']
  const stats: Record<string, any> = {}

  for (const prefix of prefixes) {
    try {
      const key = `ratelimit:${prefix}:${userId}`
      const data = await client.get(key)

      if (data) {
        stats[prefix] = data
      }
    } catch (error) {
      logger.error({
        type: 'rate_limit_stats_error',
        prefix,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return {
    enabled: true,
    stats,
  }
}

/**
 * Reset rate limit for a user (admin function)
 */
export async function resetRateLimit(userId: string, prefix?: string): Promise<void> {
  if (!config.rateLimit.redis) {
    return
  }

  const client = getRedisClient()
  const prefixes = prefix
    ? [prefix]
    : ['chat', 'bot-creation', 'orchestrator', 'global']

  for (const p of prefixes) {
    try {
      const key = `ratelimit:${p}:${userId}`
      await client.del(key)

      logger.info({
        type: 'rate_limit_reset',
        userId,
        prefix: p,
      })
    } catch (error) {
      logger.error({
        type: 'rate_limit_reset_error',
        prefix: p,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

/**
 * Custom rate limiter for specific use cases
 */
export function createRateLimiter(
  prefix: string,
  requests: number,
  window: `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`
): Ratelimit | null {
  if (!config.rateLimit.enabled || !config.rateLimit.redis) {
    return null
  }

  return new Ratelimit({
    redis: getRedisClient(),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `ratelimit:${prefix}`,
  })
}

export default {
  checkRateLimit,
  enforceRateLimit,
  getRateLimitHeaders,
  addRateLimitHeaders,
  getRateLimitStats,
  resetRateLimit,
  createRateLimiter,
}
