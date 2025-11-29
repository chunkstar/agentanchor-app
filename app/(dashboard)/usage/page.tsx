import { Metadata } from 'next'
import { BarChart3 } from 'lucide-react'
import ComingSoonPage from '@/components/navigation/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Usage - AgentAnchor',
  description: 'Track your agent usage',
}

export default function UsagePage() {
  return (
    <ComingSoonPage
      title="Usage"
      description="Monitor your agent usage, API calls, and resource consumption."
      icon={BarChart3}
      features={[
        'Detailed usage analytics',
        'API call monitoring',
        'Cost tracking and projections',
        'Usage limits and quotas',
      ]}
    />
  )
}
