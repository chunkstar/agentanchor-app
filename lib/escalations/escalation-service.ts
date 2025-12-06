/**
 * Escalation Service - Human-in-the-loop review management
 * FR76-81: Human escalation handling
 */

import { createClient } from '@/lib/supabase/server'
import { recordHumanOverride } from '@/lib/truth-chain'
// TODO: Re-enable when notifications service is complete
// import { notifyEscalation } from '@/lib/notifications'

export type EscalationStatus = 'pending' | 'assigned' | 'in_review' | 'approved' | 'rejected' | 'expired'
export type EscalationPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Escalation {
  id: string
  decisionId: string
  agentId: string
  agentName?: string
  status: EscalationStatus
  priority: EscalationPriority
  reason: string
  context: {
    actionType: string
    actionDetails: string
    riskLevel: number
    councilVotes?: Record<string, string>
    precedentConflicts?: string[]
  }
  assignedTo?: string
  assignedToName?: string
  assignedAt?: string
  resolution?: string
  resolutionReason?: string
  resolvedBy?: string
  resolvedAt?: string
  createsPrecedent: boolean
  precedentNote?: string
  expiresAt?: string
  createdAt: string
}

export interface EscalationFilters {
  status?: EscalationStatus[]
  priority?: EscalationPriority[]
  assignedTo?: string
  agentId?: string
}

export interface CreateEscalationInput {
  decisionId: string
  agentId: string
  reason: string
  priority?: EscalationPriority
  context: Escalation['context']
  expiresInHours?: number
}

export interface ResolveEscalationInput {
  resolution: 'approved' | 'rejected'
  resolutionReason: string
  createsPrecedent?: boolean
  precedentNote?: string
}

// ============================================================================
// Escalation CRUD
// ============================================================================

/**
 * Create a new escalation from a Council decision
 */
export async function createEscalation(
  input: CreateEscalationInput
): Promise<Escalation> {
  const supabase = createClient()

  // Calculate priority based on risk level if not provided
  const priority = input.priority || getPriorityFromRisk(input.context.riskLevel)

  // Calculate expiry (default 72 hours for critical, 7 days otherwise)
  const expiresInHours = input.expiresInHours || (priority === 'critical' ? 72 : 168)
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('escalations')
    .insert({
      decision_id: input.decisionId,
      agent_id: input.agentId,
      reason: input.reason,
      priority,
      context: input.context,
      expires_at: expiresAt,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to create escalation: ${error.message}`)
  }

  // TODO: Re-enable when notifications service is complete
  // await notifyEscalation({
  //   escalationId: data.id,
  //   priority,
  //   reason: input.reason,
  //   agentId: input.agentId,
  // })

  return mapEscalation(data)
}

/**
 * Get escalations with filters
 */
export async function getEscalations(
  filters?: EscalationFilters,
  limit = 50,
  offset = 0
): Promise<{ escalations: Escalation[]; total: number }> {
  const supabase = createClient()

  let query = supabase
    .from('escalations')
    .select(`
      *,
      agent:bots(name),
      assignee:users!escalations_assigned_to_fkey(email)
    `, { count: 'exact' })

  // Apply filters
  if (filters?.status?.length) {
    query = query.in('status', filters.status)
  }
  if (filters?.priority?.length) {
    query = query.in('priority', filters.priority)
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }
  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId)
  }

  // Order by priority and creation date
  query = query
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch escalations: ${error.message}`)
  }

  return {
    escalations: (data || []).map(e => ({
      ...mapEscalation(e),
      agentName: e.agent?.name,
      assignedToName: e.assignee?.email,
    })),
    total: count || 0,
  }
}

/**
 * Get a single escalation by ID
 */
export async function getEscalation(id: string): Promise<Escalation | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escalations')
    .select(`
      *,
      agent:bots(name, trust_score, trust_tier),
      assignee:users!escalations_assigned_to_fkey(email),
      decision:council_decisions(*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...mapEscalation(data),
    agentName: data.agent?.name,
    assignedToName: data.assignee?.email,
  }
}

/**
 * Assign an escalation to a human reviewer
 */
export async function assignEscalation(
  escalationId: string,
  userId: string
): Promise<Escalation> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escalations')
    .update({
      assigned_to: userId,
      assigned_at: new Date().toISOString(),
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', escalationId)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to assign escalation: ${error.message}`)
  }

  return mapEscalation(data)
}

/**
 * Start reviewing an escalation
 */
export async function startReview(
  escalationId: string,
  userId: string
): Promise<Escalation> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('escalations')
    .update({
      status: 'in_review',
      assigned_to: userId,
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', escalationId)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to start review: ${error.message}`)
  }

  return mapEscalation(data)
}

/**
 * Resolve an escalation
 */
export async function resolveEscalation(
  escalationId: string,
  userId: string,
  input: ResolveEscalationInput
): Promise<Escalation> {
  const supabase = createClient()

  // Get the escalation first
  const { data: escalation } = await supabase
    .from('escalations')
    .select('*, decision:council_decisions(*)')
    .eq('id', escalationId)
    .single()

  if (!escalation) {
    throw new Error('Escalation not found')
  }

  // Update escalation
  const { data, error } = await supabase
    .from('escalations')
    .update({
      status: input.resolution,
      resolution: input.resolution,
      resolution_reason: input.resolutionReason,
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
      creates_precedent: input.createsPrecedent || false,
      precedent_note: input.precedentNote,
      updated_at: new Date().toISOString(),
    })
    .eq('id', escalationId)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to resolve escalation: ${error.message}`)
  }

  // Update the original Council decision
  await supabase
    .from('council_decisions')
    .update({
      status: input.resolution === 'approved' ? 'approved' : 'rejected',
      human_override: true,
      human_override_reason: input.resolutionReason,
      human_override_by: userId,
      decided_at: new Date().toISOString(),
    })
    .eq('id', escalation.decision_id)

  // Record on Truth Chain
  await recordHumanOverride({
    decisionId: escalation.decision_id,
    agentId: escalation.agent_id,
    resolution: input.resolution,
    reason: input.resolutionReason,
    reviewerId: userId,
    createsPrecedent: input.createsPrecedent || false,
    precedentNote: input.precedentNote,
  })

  return mapEscalation(data)
}

/**
 * Get escalation statistics
 */
export async function getEscalationStats(): Promise<{
  pending: number
  inReview: number
  resolvedToday: number
  avgResolutionHours: number
}> {
  const supabase = createClient()

  // Get counts by status
  const { data: statusCounts } = await supabase
    .from('escalations')
    .select('status')
    .in('status', ['pending', 'assigned', 'in_review'])

  const pending = (statusCounts || []).filter(e => e.status === 'pending' || e.status === 'assigned').length
  const inReview = (statusCounts || []).filter(e => e.status === 'in_review').length

  // Get resolved today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: resolvedToday } = await supabase
    .from('escalations')
    .select('*', { count: 'exact', head: true })
    .gte('resolved_at', today.toISOString())
    .in('status', ['approved', 'rejected'])

  // Calculate average resolution time
  const { data: resolved } = await supabase
    .from('escalations')
    .select('created_at, resolved_at')
    .in('status', ['approved', 'rejected'])
    .not('resolved_at', 'is', null)
    .limit(100)

  let avgResolutionHours = 0
  if (resolved && resolved.length > 0) {
    const totalHours = resolved.reduce((sum, e) => {
      const created = new Date(e.created_at).getTime()
      const resolvedAt = new Date(e.resolved_at!).getTime()
      return sum + (resolvedAt - created) / (1000 * 60 * 60)
    }, 0)
    avgResolutionHours = Math.round(totalHours / resolved.length)
  }

  return {
    pending,
    inReview,
    resolvedToday: resolvedToday || 0,
    avgResolutionHours,
  }
}

// ============================================================================
// Helpers
// ============================================================================

function getPriorityFromRisk(riskLevel: number): EscalationPriority {
  if (riskLevel >= 4) return 'critical'
  if (riskLevel >= 3) return 'high'
  if (riskLevel >= 2) return 'medium'
  return 'low'
}

function mapEscalation(data: any): Escalation {
  return {
    id: data.id,
    decisionId: data.decision_id,
    agentId: data.agent_id,
    status: data.status,
    priority: data.priority,
    reason: data.reason,
    context: data.context,
    assignedTo: data.assigned_to,
    assignedAt: data.assigned_at,
    resolution: data.resolution,
    resolutionReason: data.resolution_reason,
    resolvedBy: data.resolved_by,
    resolvedAt: data.resolved_at,
    createsPrecedent: data.creates_precedent || false,
    precedentNote: data.precedent_note,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  }
}
