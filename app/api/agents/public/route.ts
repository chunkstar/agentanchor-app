/**
 * Public Agents API
 * Returns all public/marketplace agents from the agents table
 * This includes seeded agents that don't require user ownership
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/agents/public - List all public agents
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const category = searchParams.get('category')
    const minTrust = searchParams.get('min_trust')
    const sortBy = searchParams.get('sort_by') || 'trust_score'
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '24')
    const offset = (page - 1) * perPage

    // Build query for agents table
    let agentQuery = supabase
      .from('agents')
      .select('*', { count: 'exact' })

    // Filter by search query
    if (query) {
      agentQuery = agentQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,specialization.ilike.%${query}%`)
    }

    // Filter by category/specialization
    if (category && category !== 'all') {
      agentQuery = agentQuery.eq('specialization', category)
    }

    // Filter by minimum trust score
    if (minTrust) {
      agentQuery = agentQuery.gte('trust_score', parseInt(minTrust))
    }

    // Sorting
    switch (sortBy) {
      case 'trust_score':
        agentQuery = agentQuery.order('trust_score', { ascending: false })
        break
      case 'name':
        agentQuery = agentQuery.order('name', { ascending: true })
        break
      case 'newest':
        agentQuery = agentQuery.order('created_at', { ascending: false })
        break
      default:
        agentQuery = agentQuery.order('trust_score', { ascending: false })
    }

    // Pagination
    agentQuery = agentQuery.range(offset, offset + perPage - 1)

    const { data: agents, error, count } = await agentQuery

    if (error) {
      console.error('Error fetching public agents:', error)
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      )
    }

    // Get unique specializations for categories
    const { data: specializations } = await supabase
      .from('agents')
      .select('specialization')
      .not('specialization', 'is', null)

    const categories = [...new Set(
      (specializations || [])
        .map(s => s.specialization)
        .filter(Boolean)
    )].sort()

    return NextResponse.json({
      agents: agents || [],
      total: count || 0,
      page,
      per_page: perPage,
      has_more: (offset + (agents?.length || 0)) < (count || 0),
      categories,
    })
  } catch (error) {
    console.error('Public agents GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
