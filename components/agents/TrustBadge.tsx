'use client'

import { Shield, ShieldCheck, ShieldAlert, Star, Crown, Sparkles } from 'lucide-react'
import { TrustTier, TRUST_TIERS } from '@/lib/agents/types'

interface TrustBadgeProps {
  score: number
  tier: TrustTier
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
  showLabel?: boolean
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
  untrusted: 'text-gray-400 bg-gray-100 dark:bg-gray-800',
  novice: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  proven: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  trusted: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  elite: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  legendary: 'text-amber-500 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
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
}: TrustBadgeProps) {
  const Icon = tierIcons[tier]
  const tierInfo = TRUST_TIERS[tier]
  const sizes = sizeClasses[size]

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${tierColors[tier]} ${sizes.container}`}
      title={`Trust Score: ${score}/1000 - ${tierInfo.label}`}
    >
      <Icon className={sizes.icon} />
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
  const percentage = (score / 1000) * 100

  return (
    <div className="flex items-center gap-2">
      <TrustBadge score={score} tier={tier} size="sm" showLabel={false} />
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{tierInfo.label}</span>
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
