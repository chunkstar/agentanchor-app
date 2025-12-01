import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { evaluateRequest, RiskLevel, UpchainRequest } from '@/lib/council'

export const dynamic = 'force-dynamic'

const evaluateSchema = z.object({
  agentId: z.string().uuid(),
  actionType: z.string().min(1),
  actionDetails: z.string().min(1),
  context: z.record(z.any()).optional().default({}),
  justification: z.string().min(1),
  riskLevel: z.number().min(0).max(4),
})

// POST /api/council/evaluate - Submit an action for Council evaluation
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = evaluateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { agentId, actionType, actionDetails, context, justification, riskLevel } = validation.data

    // Verify agent belongs to user or user has permission
    const { data: agent, error: agentError } = await supabase
      .from('bots')
      .select('id, name, trust_score, trust_tier, user_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // For now, only agent owner can request evaluation
    if (agent.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build upchain request
    const upchainRequest: UpchainRequest = {
      id: crypto.randomUUID(),
      agentId,
      actionType,
      actionDetails,
      context: {
        ...context,
        agentName: agent.name,
        trustScore: agent.trust_score,
        trustTier: agent.trust_tier,
      },
      justification,
      riskLevel: riskLevel as RiskLevel,
      requestedAt: new Date().toISOString(),
    }

    // Evaluate through Council
    const decision = await evaluateRequest(upchainRequest)

    // Store decision in database
    const { error: insertError } = await supabase
      .from('bot_decisions')
      .insert({
        bot_id: agentId,
        decision_type: decision.outcome === 'approved' ? 'execute' :
                       decision.outcome === 'denied' ? 'escalate' : 'ask',
        action_taken: actionType,
        context_data: {
          upchainRequest,
          councilDecision: decision,
        },
        reasoning: decision.finalReasoning,
        confidence_score: decision.votes.length > 0
          ? decision.votes.reduce((sum, v) => sum + v.confidence, 0) / decision.votes.length
          : 1.0,
        risk_level: ['low', 'low', 'medium', 'high', 'critical'][riskLevel],
      })

    if (insertError) {
      console.error('Error storing decision:', insertError)
      // Continue anyway - decision was made
    }

    // If creates precedent, could store separately (future enhancement)

    return NextResponse.json({
      decision: {
        id: decision.id,
        outcome: decision.outcome,
        reasoning: decision.finalReasoning,
        votes: decision.votes.map(v => ({
          validator: v.validatorId,
          decision: v.decision,
          reasoning: v.reasoning,
          confidence: v.confidence,
        })),
        createsPrecedent: decision.createsPrecedent,
      },
      request: {
        id: upchainRequest.id,
        actionType,
        riskLevel,
      },
    })
  } catch (error) {
    console.error('Council evaluate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
