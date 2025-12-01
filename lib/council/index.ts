// Council Module - Public API
export * from './types'
export * from './validators'
export {
  evaluateRequest,
  evaluateExamination,
} from './council-service'
export {
  assessRisk,
  canAutoApprove,
  getRequiredApproval,
} from './risk-assessment'
export {
  submitUpchainRequest,
  getPendingRequests,
  getDecisionHistory,
  recordHumanResponse,
} from './upchain-service'
export type { UpchainSubmission, UpchainResult } from './upchain-service'
export {
  createEscalation,
  getPendingEscalations,
  getEscalationById,
  assignEscalation,
  respondToEscalation,
  cancelEscalation,
  getEscalationHistory,
  getEscalationStats,
} from './escalation-service'
export type {
  Escalation,
  EscalationStatus,
  EscalationPriority,
  HumanDecision,
  CreateEscalationInput,
  EscalationResponse,
} from './escalation-service'
