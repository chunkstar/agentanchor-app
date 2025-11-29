import { Metadata } from 'next'
import { Scale } from 'lucide-react'
import ComingSoonPage from '@/components/navigation/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Council - AgentAnchor',
  description: 'AI governance council',
}

export default function CouncilPage() {
  return (
    <ComingSoonPage
      title="Council"
      description="The validator tribunal that governs agent decisions and maintains trust across the platform."
      icon={Scale}
      features={[
        'Validator agent tribunal for high-risk decisions',
        'Risk level classification and escalation',
        'Precedent library for consistent rulings',
        'Human escalation override controls',
      ]}
    />
  )
}
