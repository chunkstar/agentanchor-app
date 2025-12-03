'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Bot,
  Star,
  Users,
  Activity,
  Shield,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  ExternalLink,
  MessageSquare,
  RefreshCw,
} from 'lucide-react'
import TrustBadge from '@/components/agents/TrustBadge'
import { ListingWithAgent, FeedbackWithConsumer } from '@/lib/marketplace/types'
import { TrustTier } from '@/lib/agents/types'

interface ListingDetailPageProps {
  params: { id: string }
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter()
  const [listing, setListing] = useState<ListingWithAgent | null>(null)
  const [feedback, setFeedback] = useState<FeedbackWithConsumer[]>([])
  const [ratingDistribution, setRatingDistribution] = useState<{ rating: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [acquiring, setAcquiring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchListing()
    fetchFeedback()
    fetchRatingDistribution()
  }, [params.id])

  async function fetchListing() {
    try {
      const res = await fetch(`/api/marketplace/listings/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setListing(data.listing)
      } else {
        setError('Listing not found')
      }
    } catch (err) {
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  async function fetchFeedback() {
    try {
      const res = await fetch(`/api/marketplace/feedback?listing_id=${params.id}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setFeedback(data.feedback || [])
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err)
    }
  }

  async function fetchRatingDistribution() {
    try {
      const res = await fetch(`/api/marketplace/feedback?listing_id=${params.id}&distribution=true`)
      if (res.ok) {
        const data = await res.json()
        setRatingDistribution(data.distribution || [])
      }
    } catch (err) {
      console.error('Failed to fetch distribution:', err)
    }
  }

  async function handleAcquire() {
    if (!listing) return
    setAcquiring(true)

    try {
      const res = await fetch('/api/marketplace/acquisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/agents?acquired=true')
      } else {
        alert(data.error || 'Failed to acquire agent')
      }
    } catch (err) {
      alert('Failed to acquire agent')
    } finally {
      setAcquiring(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="text-center py-24">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-semibold text-neutral-100 mb-2">
          {error || 'Listing not found'}
        </h2>
        <Link href="/marketplace" className="text-blue-400 hover:underline">
          Back to Marketplace
        </Link>
      </div>
    )
  }

  const { agent } = listing
  const totalRatings = ratingDistribution.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-neutral-800 flex items-center justify-center">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-100">
                      {listing.title}
                    </h1>
                    <p className="text-neutral-400 mt-1">{agent?.name}</p>
                  </div>
                  {agent && (
                    <TrustBadge
                      score={agent.trust_score}
                      tier={agent.trust_tier as TrustTier}
                      size="lg"
                    />
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 mt-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    {listing.average_rating ? (
                      <>
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-neutral-100 font-medium">
                          {listing.average_rating.toFixed(1)}
                        </span>
                        <span className="text-neutral-500">
                          ({listing.rating_count} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-neutral-500">No reviews yet</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Users className="w-5 h-5" />
                    <span>{listing.total_acquisitions} users</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Activity className="w-5 h-5" />
                    <span>{listing.total_tasks_completed.toLocaleString()} tasks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-neutral-100 mb-4">Description</h2>
            <p className="text-neutral-300 whitespace-pre-wrap">{listing.description}</p>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-neutral-800 text-neutral-400 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Observer Summary (FR26, FR105) */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Observer Report Summary
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-400">
                  {listing.total_tasks_completed.toLocaleString()}
                </p>
                <p className="text-sm text-neutral-500">Total Tasks</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-400">
                  {agent?.trust_score || 0}
                </p>
                <p className="text-sm text-neutral-500">Trust Score</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-400">
                  {listing.rating_count}
                </p>
                <p className="text-sm text-neutral-500">Reviews</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-neutral-100 font-medium">Verified</span>
                </div>
                <p className="text-sm text-neutral-500">Governance</p>
              </div>
            </div>

            <Link
              href={`/agents/${listing.agent_id}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:underline"
            >
              View Full Agent Profile
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Reviews Section */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
            <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Reviews
            </h2>

            {/* Rating Distribution */}
            {totalRatings > 0 && (
              <div className="mb-6 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const item = ratingDistribution.find((r) => r.rating === rating)
                  const count = item?.count || 0
                  const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="w-8 text-sm text-neutral-400">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-neutral-500 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Reviews List */}
            {feedback.length === 0 ? (
              <p className="text-neutral-500">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-neutral-800 pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= item.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-neutral-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-neutral-400 text-sm">
                        {item.consumer?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-neutral-600 text-sm">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {item.title && (
                      <h4 className="font-medium text-neutral-100 mb-1">
                        {item.title}
                      </h4>
                    )}
                    {item.review && (
                      <p className="text-neutral-400 text-sm">{item.review}</p>
                    )}
                    {item.trainer_response && (
                      <div className="mt-3 pl-4 border-l-2 border-neutral-700">
                        <p className="text-sm text-neutral-500 mb-1">
                          Trainer Response:
                        </p>
                        <p className="text-sm text-neutral-400">
                          {item.trainer_response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Acquisition Card */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-neutral-100 mb-4">
              Acquire This Agent
            </h3>

            <div className="space-y-4">
              {/* Pricing */}
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-neutral-500 mb-1">Commission Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  ${listing.commission_rate.toFixed(4)}
                  <span className="text-sm font-normal text-neutral-400">
                    /task
                  </span>
                </p>
                {listing.complexity_multiplier !== 1.0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Complexity multiplier: {listing.complexity_multiplier}x
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <p className="text-sm text-neutral-500 mb-1">Category</p>
                <span className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-sm capitalize">
                  {listing.category.replace('_', ' ')}
                </span>
              </div>

              {/* Trust Tier Benefits */}
              <div>
                <p className="text-sm text-neutral-500 mb-2">Trust Benefits</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-neutral-400">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Council-governed decisions
                  </li>
                  <li className="flex items-center gap-2 text-neutral-400">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Full Observer audit trail
                  </li>
                  <li className="flex items-center gap-2 text-neutral-400">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Truth Chain verification
                  </li>
                </ul>
              </div>

              {/* Acquire Button */}
              <button
                onClick={handleAcquire}
                disabled={acquiring}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {acquiring ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Acquiring...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Acquire Agent
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-500 text-center">
                Pay only for usage. No upfront cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
