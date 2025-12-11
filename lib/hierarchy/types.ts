/**
 * Agent Hierarchy Types
 *
 * L0-L8 hierarchy levels define ROLES (what agents can do)
 * Trust scores define ABILITY (how well agents perform within their role)
 */

// ============================================================================
// Hierarchy Levels (from BAI ai-workforce)
// ============================================================================

export type HierarchyLevel =
  | 'L0_listener'           // Passive observer - no autonomous action
  | 'L1_executor'           // Single task execution specialist
  | 'L2_planner'            // Decomposes requests into task specs
  | 'L3_orchestrator'       // Coordinates L1/L2 agents
  | 'L4_project_planner'    // Plans multi-agent projects
  | 'L5_project_orchestrator' // Cross-project coordination
  | 'L6_portfolio'          // Resource allocation
  | 'L7_strategic'          // Long-term direction
  | 'L8_executive'          // Governance with human oversight

export type AuthorityScope = 'none' | 'task' | 'project' | 'portfolio' | 'strategic' | 'governance'

export interface HierarchyLevelConfig {
  level: HierarchyLevel
  name: string
  description: string
  authorityScope: AuthorityScope
  maxAutonomyLevel: number // Max autonomy achievable at this hierarchy
  canTrainOthers: boolean
  canApproveOthers: boolean
  requiresHumanOversight: boolean
  minTrustScore: number // Min trust to operate at this level
}

export const HIERARCHY_LEVELS: Record<HierarchyLevel, HierarchyLevelConfig> = {
  L0_listener: {
    level: 'L0_listener',
    name: 'Listener',
    description: 'Passive observer - monitors and reports only',
    authorityScope: 'none',
    maxAutonomyLevel: 1,
    canTrainOthers: false,
    canApproveOthers: false,
    requiresHumanOversight: false,
    minTrustScore: 0
  },
  L1_executor: {
    level: 'L1_executor',
    name: 'Executor',
    description: 'Single task execution specialist',
    authorityScope: 'task',
    maxAutonomyLevel: 3,
    canTrainOthers: false,
    canApproveOthers: false,
    requiresHumanOversight: false,
    minTrustScore: 200
  },
  L2_planner: {
    level: 'L2_planner',
    name: 'Planner',
    description: 'Decomposes requests into task specifications',
    authorityScope: 'task',
    maxAutonomyLevel: 3,
    canTrainOthers: false,
    canApproveOthers: false,
    requiresHumanOversight: false,
    minTrustScore: 300
  },
  L3_orchestrator: {
    level: 'L3_orchestrator',
    name: 'Orchestrator',
    description: 'Coordinates L1/L2 agents on complex tasks',
    authorityScope: 'project',
    maxAutonomyLevel: 4,
    canTrainOthers: true,
    canApproveOthers: false,
    requiresHumanOversight: false,
    minTrustScore: 400
  },
  L4_project_planner: {
    level: 'L4_project_planner',
    name: 'Project Planner',
    description: 'Plans and tracks multi-agent projects',
    authorityScope: 'project',
    maxAutonomyLevel: 4,
    canTrainOthers: true,
    canApproveOthers: true,
    requiresHumanOversight: false,
    minTrustScore: 500
  },
  L5_project_orchestrator: {
    level: 'L5_project_orchestrator',
    name: 'Project Orchestrator',
    description: 'Orchestrates across multiple projects',
    authorityScope: 'portfolio',
    maxAutonomyLevel: 4,
    canTrainOthers: true,
    canApproveOthers: true,
    requiresHumanOversight: false,
    minTrustScore: 600
  },
  L6_portfolio: {
    level: 'L6_portfolio',
    name: 'Portfolio Manager',
    description: 'Resource allocation across project portfolio',
    authorityScope: 'portfolio',
    maxAutonomyLevel: 5,
    canTrainOthers: true,
    canApproveOthers: true,
    requiresHumanOversight: false,
    minTrustScore: 700
  },
  L7_strategic: {
    level: 'L7_strategic',
    name: 'Strategic',
    description: 'Long-term direction and capability planning',
    authorityScope: 'strategic',
    maxAutonomyLevel: 5,
    canTrainOthers: true,
    canApproveOthers: true,
    requiresHumanOversight: true,
    minTrustScore: 800
  },
  L8_executive: {
    level: 'L8_executive',
    name: 'Executive',
    description: 'Governance decisions with human oversight',
    authorityScope: 'governance',
    maxAutonomyLevel: 5,
    canTrainOthers: true,
    canApproveOthers: true,
    requiresHumanOversight: true,
    minTrustScore: 900
  }
}

// ============================================================================
// Hierarchy Relationships
// ============================================================================

export interface HierarchyRelationship {
  agentId: string
  hierarchyLevel: HierarchyLevel
  hierarchyDomain: string
  canDelegateTo: HierarchyLevel[]
  reportsTo: HierarchyLevel[]
}

// Which levels can delegate to which
export const DELEGATION_RULES: Record<HierarchyLevel, HierarchyLevel[]> = {
  L0_listener: [],
  L1_executor: [],
  L2_planner: ['L1_executor'],
  L3_orchestrator: ['L1_executor', 'L2_planner'],
  L4_project_planner: ['L1_executor', 'L2_planner', 'L3_orchestrator'],
  L5_project_orchestrator: ['L1_executor', 'L2_planner', 'L3_orchestrator', 'L4_project_planner'],
  L6_portfolio: ['L3_orchestrator', 'L4_project_planner', 'L5_project_orchestrator'],
  L7_strategic: ['L4_project_planner', 'L5_project_orchestrator', 'L6_portfolio'],
  L8_executive: ['L5_project_orchestrator', 'L6_portfolio', 'L7_strategic']
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getHierarchyLevel(level: HierarchyLevel): HierarchyLevelConfig {
  return HIERARCHY_LEVELS[level]
}

export function getLevelNumber(level: HierarchyLevel): number {
  const match = level.match(/L(\d)/)
  return match ? parseInt(match[1]) : 0
}

export function canDelegate(from: HierarchyLevel, to: HierarchyLevel): boolean {
  return DELEGATION_RULES[from].includes(to)
}

export function canApprove(level: HierarchyLevel): boolean {
  return HIERARCHY_LEVELS[level].canApproveOthers
}

export function canTrain(level: HierarchyLevel): boolean {
  return HIERARCHY_LEVELS[level].canTrainOthers
}

export function requiresHumanOversight(level: HierarchyLevel): boolean {
  return HIERARCHY_LEVELS[level].requiresHumanOversight
}

export function meetsMinTrust(level: HierarchyLevel, trustScore: number): boolean {
  return trustScore >= HIERARCHY_LEVELS[level].minTrustScore
}

export function getMaxAutonomy(level: HierarchyLevel): number {
  return HIERARCHY_LEVELS[level].maxAutonomyLevel
}

export function getAuthorityScope(level: HierarchyLevel): AuthorityScope {
  return HIERARCHY_LEVELS[level].authorityScope
}

// Get all levels that can be managed by a given level
export function getManagedLevels(level: HierarchyLevel): HierarchyLevel[] {
  const levelNum = getLevelNumber(level)
  return Object.keys(HIERARCHY_LEVELS).filter(l => {
    const otherNum = getLevelNumber(l as HierarchyLevel)
    return otherNum < levelNum
  }) as HierarchyLevel[]
}
