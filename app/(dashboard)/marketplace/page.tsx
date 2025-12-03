'use client'

import { useState, useEffect } from 'react'
import { Store, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import ListingCard from '@/components/marketplace/ListingCard'
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters'
import { ListingWithAgent, MarketplaceCategory, ListingSearchParams } from '@/lib/marketplace/types'

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingWithAgent[]>([])
  const [featuredListings, setFeaturedListings] = useState<ListingWithAgent[]>([])
  const [categories, setCategories] = useState<MarketplaceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [searchParams, setSearchParams] = useState<ListingSearchParams>({})

  useEffect(() => {
    fetchCategories()
    fetchFeatured()
  }, [])

  useEffect(() => {
    fetchListings()
  }, [searchParams, offset])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/marketplace/listings?categories=true')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  async function fetchFeatured() {
    try {
      const res = await fetch('/api/marketplace/listings?featured=true&limit=4')
      if (res.ok) {
        const data = await res.json()
        setFeaturedListings(data.listings || [])
      }
    } catch (err) {
      console.error('Failed to fetch featured:', err)
    }
  }

  async function fetchListings() {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (searchParams.query) params.set('query', searchParams.query)
      if (searchParams.category) params.set('category', searchParams.category)
      if (searchParams.min_trust_score) params.set('min_trust_score', String(searchParams.min_trust_score))
      if (searchParams.min_rating) params.set('min_rating', String(searchParams.min_rating))
      if (searchParams.sort_by) params.set('sort_by', searchParams.sort_by)
      params.set('limit', '20')
      params.set('offset', String(offset))

      const res = await fetch(`/api/marketplace/listings?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (offset === 0) {
          setListings(data.listings || [])
        } else {
          setListings(prev => [...prev, ...(data.listings || [])])
        }
        setTotal(data.total || 0)
        setHasMore(data.has_more || false)
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (params: ListingSearchParams) => {
    setOffset(0)
    setSearchParams(params)
  }

  const loadMore = () => {
    setOffset(prev => prev + 20)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 flex items-center gap-3">
          <Store className="w-7 h-7 text-blue-400" />
          Marketplace
        </h1>
        <p className="text-neutral-400 mt-1">
          Discover governed AI agents from trusted trainers with transparent trust scores
        </p>
      </div>

      {/* Featured Section */}
      {featuredListings.length > 0 && !searchParams.query && !searchParams.category && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Featured Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <MarketplaceFilters
        categories={categories}
        onSearch={handleSearch}
        initialParams={searchParams}
      />

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            {searchParams.query || searchParams.category ? 'Search Results' : 'All Agents'}
          </h2>
          <span className="text-sm text-neutral-500">
            {total} {total === 1 ? 'agent' : 'agents'} found
          </span>
        </div>

        {loading && listings.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-neutral-500" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900 rounded-lg border border-neutral-800">
            <Store className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
            <p className="text-neutral-400">No agents found</p>
            <p className="text-sm text-neutral-500 mt-1">
              Try adjusting your search filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
