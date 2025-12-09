/**
 * Credential Refresh API
 * POST - Refresh an existing credential before expiry
 *
 * Story 15-4: Credential Refresh (Auto-refresh before expiry)
 * Epic 15: Portable Trust Credentials (MOAT BUILDER)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  refreshCredential,
  decodeCredential,
  getTrustTier,
  CREDENTIAL_REFRESH_WINDOW_HOURS,
  addToRevocationCache,
  type RevocationReason,
} from '@/lib/credentials'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Decode to get agent ID
    const decoded = decodeCredential(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid credential format' }, { status: 400 })
    }

    const agentId = decoded.sub

    // Fetch current agent data
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
      return NextResponse.json({ error: 'Not authorized to refresh credentials for this agent' }, { status: 403 })
    }

    // Check if credential is in database and not revoked
    const { data: credRecord } = await supabase
      .from('credentials')
      .select('*')
      .eq('jwt_id', decoded.jti)
      .single()

    const checkRevocation = async (jwtId: string): Promise<boolean> => {
      const { data } = await supabase
        .from('credential_revocations')
        .select('id')
        .eq('jwt_id', jwtId)
        .single()
      return !!data
    }

    // Fetch governance summary
    const { data: decisions } = await supabase
      .from('council_decisions')
      .select('id, outcome, created_at')
      .eq('agent_id', agentId)

    const governanceSummary = {
      totalDecisions: decisions?.length ?? 0,
      approvalRate: decisions?.length
        ? decisions.filter(d => d.outcome === 'approved').length / decisions.length
        : 0,
      escalationRate: 0,
      lastCouncilReview: decisions?.length
        ? decisions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at
        : undefined,
    }

    // Fetch latest truth chain record
    const { data: truthChainRecord } = await supabase
      .from('truth_chain')
      .select('hash, block_height')
      .eq('entity_type', 'agent')
      .eq('entity_id', agentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Refresh the credential
    const result = await refreshCredential(
      {
        existingToken: token,
        currentTrustScore: agent.trust_score,
        trainerId: user.id,
        governanceSummary,
        certificationData: {
          academyGraduated: !!agent.graduated_at,
          graduationDate: agent.graduated_at,
          specializations: [],
          mentorCertified: false,
        },
        truthChainHash: truthChainRecord?.hash,
        truthChainBlockHeight: truthChainRecord?.block_height,
      },
      { checkRevocation }
    )

    if (!result.success) {
      return NextResponse.json({
        error: result.error,
        errorCode: result.errorCode,
        refreshWindowHours: CREDENTIAL_REFRESH_WINDOW_HOURS,
      }, { status: 400 })
    }

    // Mark old credential as expired in database
    if (result.parentJwtId) {
      await supabase
        .from('credentials')
        .update({ status: 'expired' })
        .eq('jwt_id', result.parentJwtId)
    }

    // Store new credential record
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
        certification_data: {
          academyGraduated: !!agent.graduated_at,
          graduationDate: agent.graduated_at,
          specializations: [],
          mentorCertified: false,
        },
        truth_chain_hash: truthChainRecord?.hash,
        truth_chain_block_height: truthChainRecord?.block_height,
        jwt_id: result.credential!.jwtId,
        key_id: `aa_key_${new Date().getFullYear()}_001`,
        issued_at: result.credential!.issuedAt.toISOString(),
        expires_at: result.credential!.expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Failed to store refreshed credential:', insertError)
    }

    return NextResponse.json({
      success: true,
      credential: {
        token: result.credential!.token,
        jwtId: result.credential!.jwtId,
        issuedAt: result.credential!.issuedAt.toISOString(),
        expiresAt: result.credential!.expiresAt.toISOString(),
        parentJwtId: result.parentJwtId,
        agent: {
          id: agentId,
          name: agent.name,
          trustScore: agent.trust_score,
          trustTier: tier.name,
        },
      },
    })
  } catch (error: any) {
    console.error('Credential refresh error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
