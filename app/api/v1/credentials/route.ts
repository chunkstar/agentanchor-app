/**
 * Portable Trust Credentials API
 * POST - Issue a new credential (FR157-159)
 *
 * Epic 15: Portable Trust Credentials (MOAT BUILDER)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  issueCredential,
  getTrustTier,
  MIN_CREDENTIAL_TRUST_SCORE,
  type IssuedCredential,
} from '@/lib/credentials'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    // Fetch agent data to validate ownership and trust score
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Verify ownership
    if (agent.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to issue credentials for this agent' }, { status: 403 })
    }

    // Check eligibility (FR157: Trust Score 250+)
    if (agent.trust_score < MIN_CREDENTIAL_TRUST_SCORE) {
      const tier = getTrustTier(agent.trust_score)
      return NextResponse.json({
        error: 'Agent does not meet minimum trust score requirement',
        details: {
          required: MIN_CREDENTIAL_TRUST_SCORE,
          current: agent.trust_score,
          currentTier: tier.name,
          message: `Agent must have Trust Score of ${MIN_CREDENTIAL_TRUST_SCORE}+ (Developing tier or higher) to receive a Portable Trust Credential`,
        },
      }, { status: 400 })
    }

    // Check agent status
    if (agent.status !== 'active') {
      return NextResponse.json({
        error: 'Only active agents can receive credentials',
        details: { currentStatus: agent.status },
      }, { status: 400 })
    }

    // Fetch governance summary from council decisions
    const { data: decisions } = await supabase
      .from('council_decisions')
      .select('id, outcome, created_at')
      .eq('agent_id', agentId)

    const governanceSummary = {
      totalDecisions: decisions?.length ?? 0,
      approvalRate: decisions?.length
        ? decisions.filter(d => d.outcome === 'approved').length / decisions.length
        : 0,
      escalationRate: 0, // TODO: Calculate from escalations
      lastCouncilReview: decisions?.length
        ? decisions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at
        : undefined,
    }

    // Fetch certification data
    const { data: academyProgress } = await supabase
      .from('academy_progress')
      .select('*')
      .eq('agent_id', agentId)
      .single()

    const certificationData = {
      academyGraduated: !!agent.graduated_at,
      graduationDate: agent.graduated_at,
      specializations: [], // TODO: Fetch from specializations table when available
      mentorCertified: false, // TODO: Implement mentorship
    }

    // Fetch latest truth chain record for anchor
    const { data: truthChainRecord } = await supabase
      .from('truth_chain')
      .select('hash, block_height')
      .eq('entity_type', 'agent')
      .eq('entity_id', agentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Issue the credential
    const credential: IssuedCredential = await issueCredential({
      agentId,
      trainerId: user.id,
      trustScore: agent.trust_score,
      governanceSummary,
      certificationData,
      truthChainHash: truthChainRecord?.hash,
      truthChainBlockHeight: truthChainRecord?.block_height,
    })

    // Store credential record in database
    const tier = getTrustTier(agent.trust_score)
    const { error: insertError } = await supabase
      .from('credentials')
      .insert({
        agent_id: agentId,
        issuer_id: user.id,
        trust_score: agent.trust_score,
        trust_tier: tier.name,
        trust_tier_code: tier.code,
        governance_summary: governanceSummary,
        certification_data: certificationData,
        truth_chain_hash: truthChainRecord?.hash,
        truth_chain_block_height: truthChainRecord?.block_height,
        jwt_id: credential.jwtId,
        key_id: `aa_key_${new Date().getFullYear()}_001`,
        issued_at: credential.issuedAt.toISOString(),
        expires_at: credential.expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Failed to store credential:', insertError)
      // Continue - the credential is still valid
    }

    return NextResponse.json({
      success: true,
      credential: {
        token: credential.token,
        jwtId: credential.jwtId,
        issuedAt: credential.issuedAt.toISOString(),
        expiresAt: credential.expiresAt.toISOString(),
        agent: {
          id: agentId,
          name: agent.name,
          trustScore: agent.trust_score,
          trustTier: tier.name,
        },
      },
    })
  } catch (error: any) {
    console.error('Credential issuance error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * GET - List credentials for the authenticated user's agents
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')

    let query = supabase
      .from('credentials')
      .select(`
        *,
        agents!inner(id, name, owner_id)
      `)
      .eq('agents.owner_id', user.id)
      .order('issued_at', { ascending: false })

    if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    const { data: credentials, error } = await query

    if (error) {
      console.error('Failed to fetch credentials:', error)
      return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 })
    }

    return NextResponse.json({
      credentials: credentials?.map(c => ({
        id: c.id,
        jwtId: c.jwt_id,
        agentId: c.agent_id,
        agentName: (c as any).agents?.name,
        trustScore: c.trust_score,
        trustTier: c.trust_tier,
        status: c.status,
        issuedAt: c.issued_at,
        expiresAt: c.expires_at,
        isExpired: new Date(c.expires_at) < new Date(),
      })) ?? [],
    })
  } catch (error: any) {
    console.error('Credential list error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
