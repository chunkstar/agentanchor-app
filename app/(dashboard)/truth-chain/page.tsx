import { Metadata } from 'next'
import { Link2 } from 'lucide-react'
import ComingSoonPage from '@/components/navigation/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Truth Chain - AgentAnchor',
  description: 'Immutable audit records',
}

export default function TruthChainPage() {
  return (
    <ComingSoonPage
      title="Truth Chain"
      description="Immutable, verifiable records of all agent decisions and governance actions."
      icon={Link2}
      features={[
        'Hash chain with periodic blockchain anchoring',
        'Tamper-evident audit trail',
        'Public verification endpoints',
        'Cryptographic proof of agent behavior',
      ]}
    />
  )
}
