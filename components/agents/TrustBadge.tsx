'use client'

import { Shield, ShieldCheck, ShieldAlert, Star, Crown, Sparkles } from 'lucide-react'
import { TrustTier, TRUST_TIERS } from '@/lib/agents/types'

interface TrustBadgeProps {
  score: number
  tier: TrustTier
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
  showLabel?: boolean
  showEmoji?: boolean
}

// Emoji badges per PRD spec (FR50, FR53)
export const tierEmojis: Record<TrustTier, string> = {
  untrusted: '⚠️',
  novice: '🌱',
  proven: '✅',
  trusted: '🛡️',
  elite: '👑',
  legendary: '🌟',
}

// Autonomy limits by tier (FR54) - describes what actions are permitted
export const tierAutonomy: Record<TrustTier, { description: string; riskLevel: string }> = {
  untrusted: { description: 'Cannot operate autonomously', riskLevel: 'None' },
  novice: { description: 'Low-risk actions with logging', riskLevel: 'Low' },
  proven: { description: 'Standard actions with oversight', riskLevel: 'Medium' },
  trusted: { description: 'Most actions independently', riskLevel: 'High' },
  elite: { description: 'High-risk with minimal oversight', riskLevel: 'High+' },
  legendary: { description: 'Full autonomy, mentor privileges', riskLevel: 'All' },
}

const tierIcons: Record<TrustTier, React.ElementType> = {
  untrusted: ShieldAlert,
  novice: Shield,
  proven: ShieldCheck,
  trusted: ShieldCheck,
  elite: Star,
  legendary: Crown,
}

const tierColors: Record<TrustTier, string> = {
  untrusted: 'text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  novice: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
  proven: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
  trusted: 'text-green-600 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800',
  elite: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
  legendary: 'text-amber-500 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-300 dark:border-amber-700',
}

const sizeClasses = {
  sm: {
    container: 'px-2 py-0.5 text-xs gap-1',
    icon: 'h-3 w-3',
  },
  md: {
    container: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'h-4 w-4',
  },
  lg: {
    container: 'px-3 py-1.5 text-base gap-2',
    icon: 'h-5 w-5',
  },
}

export default function TrustBadge({
  score,
  tier,
  size = 'md',
  showScore = false,
  showLabel = true,
  showEmoji = true,
}: TrustBadgeProps) {
  const Icon = tierIcons[tier]
  const tierInfo = TRUST_TIERS[tier]
  const sizes = sizeClasses[size]
  const emoji = tierEmojis[tier]

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium border ${tierColors[tier]} ${sizes.container}`}
      title={`Trust Score: ${score}/1000 - ${tierInfo.label}`}
    >
      {showEmoji ? (
        <span className={sizes.icon} role="img" aria-label={tierInfo.label}>
          {emoji}
        </span>
      ) : (
        <Icon className={sizes.icon} />
      )}
      {showLabel && <span>{tierInfo.label}</span>}
      {showScore && (
        <span className="ml-1 opacity-75">({score})</span>
      )}
      {tier === 'legendary' && (
        <Sparkles className={`${sizes.icon} ml-0.5 animate-pulse`} />
      )}
    </div>
  )
}

// Compact version for cards
export function TrustScoreIndicator({ score, tier }: { score: number; tier: TrustTier }) {
  const tierInfo = TRUST_TIERS[tier]
  const emoji = tierEmojis[tier]
  const percentage = (score / 1000) * 100

  return (
    <div className="flex items-center gap-2">
      <TrustBadge score={score} tier={tier} size="sm" showLabel={false} />
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>
            <span role="img" aria-label={tierInfo.label}>{emoji}</span> {tierInfo.label}
          </span>
          <span>{score}/1000</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              tier === 'legendary'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                : tier === 'elite'
                ? 'bg-purple-500'
                : tier === 'trusted'
                ? 'bg-green-500'
                : tier === 'proven'
                ? 'bg-blue-500'
                : tier === 'novice'
                ? 'bg-yellow-500'
                : 'bg-gray-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Certification level badge
export function CertificationBadge({
  level,
  size = 'md',
}: {
  level: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = sizeClasses[size]

  if (level === 0) {
    return (
      <div
        className={`inline-flex items-center rounded-full font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 ${sizes.container}`}
      >
        <Shield className={sizes.icon} />
        <span>Uncertified</span>
      </div>
    )
  }

  const levelColors = [
    'text-gray-600 bg-gray-100', // Should not appear
    'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    'text-green-600 bg-green-100 dark:bg-green-900/30',
    'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    'text-rose-600 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30',
  ]

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${levelColors[level]} ${sizes.container}`}
      title={`Certification Level ${level}`}
    >
      <ShieldCheck className={sizes.icon} />
      <span>Level {level}</span>
      {level === 5 && <Sparkles className={`${sizes.icon} ml-0.5 animate-pulse`} />}
    </div>
  )
}

// Autonomy indicator showing what actions are permitted (FR54)
export function AutonomyIndicator({ tier }: { tier: TrustTier }) {
  const autonomy = tierAutonomy[tier]
  const tierInfo = TRUST_TIERS[tier]
  const emoji = tierEmojis[tier]

  const riskLevelColors: Record<string, string> = {
    'None': 'text-gray-500 bg-gray-100 dark:bg-gray-800',
    'Low': 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    'Medium': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    'High': 'text-green-600 bg-green-100 dark:bg-green-900/30',
    'High+': 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    'All': 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span role="img" aria-label={tierInfo.label} className="text-lg">
          {emoji}
        </span>
        <h4 className="font-medium text-gray-900 dark:text-white">
          {tierInfo.label} Autonomy
        </h4>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {autonomy.description}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Max Risk Level:</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskLevelColors[autonomy.riskLevel]}`}>
          {autonomy.riskLevel}
        </span>
      </div>
    </div>
  )
}

// Detailed trust tier card with all info (for profiles/tooltips)
export function TrustTierCard({ score, tier }: { score: number; tier: TrustTier }) {
  const tierInfo = TRUST_TIERS[tier]
  const emoji = tierEmojis[tier]
  const autonomy = tierAutonomy[tier]
  const percentage = (score / 1000) * 100

  // Calculate next tier threshold
  const tiers: TrustTier[] = ['untrusted', 'novice', 'proven', 'trusted', 'elite', 'legendary']
  const currentTierIndex = tiers.indexOf(tier)
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null
  const nextTierInfo = nextTier ? TRUST_TIERS[nextTier] : null
  const pointsToNext = nextTierInfo ? nextTierInfo.min - score : 0

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      {/* Header with emoji and score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span role="img" aria-label={tierInfo.label} className="text-3xl">
            {emoji}
          </span>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {tierInfo.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trust Tier
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {score}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">/ 1000</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              tier === 'legendary'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                : tier === 'elite'
                ? 'bg-purple-500'
                : tier === 'trusted'
                ? 'bg-green-500'
                : tier === 'proven'
                ? 'bg-blue-500'
                : tier === 'novice'
                ? 'bg-yellow-500'
                : 'bg-gray-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {nextTier && pointsToNext > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {pointsToNext} points to {tierEmojis[nextTier]} {TRUST_TIERS[nextTier].label}
          </p>
        )}
      </div>

      {/* Autonomy section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Autonomy Level
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {autonomy.description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Max risk level: <span className="font-medium">{autonomy.riskLevel}</span>
        </p>
      </div>
    </div>
  )
}
