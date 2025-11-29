import { Metadata } from 'next'
import { Bot } from 'lucide-react'
import ComingSoonPage from '@/components/navigation/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Agents - AgentAnchor',
  description: 'Manage your AI agents',
}

export default function AgentsPage() {
  return (
    <ComingSoonPage
      title="Agents"
      description="Create, train, and manage your AI agents with full governance and trust tracking."
      icon={Bot}
      features={[
        'Create new agents with customizable behaviors',
        'Track agent performance and trust scores',
        'View agent decision history and audit trails',
        'Manage agent permissions and autonomy levels',
      ]}
    />
  )
}
