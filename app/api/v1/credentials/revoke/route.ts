/**
 * Credential Revocation API
 * POST - Revoke a credential (instant invalidation)
 * GET - Check revocation status
 *
 * Story 15-5: Revocation System (Instant invalidation)
 * Epic 15: Portable Trust Credentials (MOAT BUILDER)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  addToRevocationCache,
  isRevokedInCache,
  decodeCredential,
  type RevocationReason,
} from '@/lib/credentials'

const VALID_REASONS: RevocationReason[] = [
  'trust_score_dropped',
  'agent_paused',
  'agent_terminated',
  'security_incident',
  'trainer_request',
  'council_decision',
  'platform_action',
  'other',
]

/**
 * POST - Revoke a credential
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jwtId, token, reason, notes } = body

    // Accept either jwtId directly or extract from token
    let targetJwtId = jwtId
    let agentId: string | undefined

    if (!targetJwtId && token) {
      const decoded = decodeCredential(token)
      if (decoded) {
        targetJwtId = decoded.jti
        agentId = decoded.sub
      }
    }

    if (!targetJwtId) {
      return NextResponse.json({ error: 'jwtId or token is required' }, { status: 400 })
    }

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({
        error: 'Valid reason is required',
        validReasons: VALID_REASONS,
      }, { status: 400 })
    }

    // Fetch credential from database
    const { data: credential, error: credError } = await supabase
      .from('credentials')
      .select('*, agents!inner(id, name, owner_id)')
      .eq('jwt_id', targetJwtId)
      .single()

    if (credError || !credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Verify ownership (trainer can revoke their agents' credentials)
    const credentialAgent = credential.agents as any
    if (credentialAgent.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to revoke this credential' }, { status: 403 })
    }

    // Check if already revoked
    if (credential.status === 'revoked') {
      return NextResponse.json({
        error: 'Credential is already revoked',
        revokedAt: credential.revoked_at,
        reason: credential.revoked_reason,
      }, { status: 400 })
    }

    const revokedAt = new Date()

    // Add to in-memory cache for immediate effect
    addToRevocationCache(targetJwtId, reason, revokedAt)

    // Update credential status in database
    const { error: updateError } = await supabase
      .from('credentials')
      .update({
        status: 'revoked',
        revoked_at: revokedAt.toISOString(),
        revoked_reason: reason,
      })
      .eq('jwt_id', targetJwtId)

    if (updateError) {
      console.error('Failed to update credential status:', updateError)
    }

    // Insert into revocations table for fast lookup
    const { error: revocationError } = await supabase
      .from('credential_revocations')
      .insert({
        jwt_id: targetJwtId,
        agent_id: credential.agent_id,
        reason,
        revoked_at: revokedAt.toISOString(),
        revoked_by: user.id,
      })

    if (revocationError) {
      console.error('Failed to insert revocation record:', revocationError)
    }

    return NextResponse.json({
      success: true,
      revocation: {
        jwtId: targetJwtId,
        agentId: credential.agent_id,
        agentName: credentialAgent.name,
        reason,
        notes,
        revokedAt: revokedAt.toISOString(),
        revokedBy: user.id,
      },
    })
  } catch (error: any) {
    console.error('Credential revocation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * GET - Check if a credential is revoked
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jwtId = searchParams.get('jwtId')

    if (!jwtId) {
      return NextResponse.json({ error: 'jwtId is required' }, { status: 400 })
    }

    // Check cache first
    if (isRevokedInCache(jwtId)) {
      return NextResponse.json({
        revoked: true,
        source: 'cache',
      })
    }

    // Check database
    const supabase = await createClient()
    const { data: revocation } = await supabase
      .from('credential_revocations')
      .select('*')
      .eq('jwt_id', jwtId)
      .single()

    if (revocation) {
      // Populate cache for future checks
      addToRevocationCache(jwtId, revocation.reason as RevocationReason, new Date(revocation.revoked_at))

      return NextResponse.json({
        revoked: true,
        source: 'database',
        reason: revocation.reason,
        revokedAt: revocation.revoked_at,
      })
    }

    return NextResponse.json({
      revoked: false,
    })
  } catch (error: any) {
    console.error('Revocation check error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE - Batch revoke all credentials for an agent
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const reason = searchParams.get('reason') as RevocationReason || 'trainer_request'

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 })
    }

    // Verify agent ownership
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, owner_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (agent.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Fetch all active credentials for the agent
    const { data: credentials } = await supabase
      .from('credentials')
      .select('jwt_id')
      .eq('agent_id', agentId)
      .eq('status', 'active')

    if (!credentials || credentials.length === 0) {
      return NextResponse.json({
        success: true,
        revokedCount: 0,
        message: 'No active credentials to revoke',
      })
    }

    const revokedAt = new Date()
    const jwtIds = credentials.map(c => c.jwt_id)

    // Add all to cache
    for (const jwtId of jwtIds) {
      addToRevocationCache(jwtId, reason, revokedAt)
    }

    // Batch update credentials
    await supabase
      .from('credentials')
      .update({
        status: 'revoked',
        revoked_at: revokedAt.toISOString(),
        revoked_reason: reason,
      })
      .in('jwt_id', jwtIds)

    // Batch insert revocations
    const revocationRecords = jwtIds.map(jwtId => ({
      jwt_id: jwtId,
      agent_id: agentId,
      reason,
      revoked_at: revokedAt.toISOString(),
      revoked_by: user.id,
    }))

    await supabase
      .from('credential_revocations')
      .insert(revocationRecords)

    return NextResponse.json({
      success: true,
      revokedCount: jwtIds.length,
      jwtIds,
      agentId,
      agentName: agent.name,
      reason,
      revokedAt: revokedAt.toISOString(),
    })
  } catch (error: any) {
    console.error('Batch revocation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
