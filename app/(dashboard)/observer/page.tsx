import { Metadata } from 'next'
import { Eye } from 'lucide-react'
import ComingSoonPage from '@/components/navigation/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Observer - AgentAnchor',
  description: 'Real-time agent monitoring',
}

export default function ObserverPage() {
  return (
    <ComingSoonPage
      title="Observer"
      description="Real-time monitoring of all agent activity with complete audit trails and anomaly detection."
      icon={Eye}
      features={[
        'Real-time event feed from all agents',
        'Anomaly detection and alerting',
        'Complete audit trail logging',
        'Dashboard analytics and insights',
      ]}
    />
  )
}
