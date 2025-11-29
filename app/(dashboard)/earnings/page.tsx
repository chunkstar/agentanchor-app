import { Metadata } from 'next'
import { Wallet } from 'lucide-react'
import ComingSoonPage from '@/components/navigation/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Earnings - AgentAnchor',
  description: 'Track your agent earnings',
}

export default function EarningsPage() {
  return (
    <ComingSoonPage
      title="Earnings"
      description="Track your earnings from agent commissions, marketplace sales, and platform rewards."
      icon={Wallet}
      features={[
        'Revenue dashboard with detailed breakdown',
        'Commission tracking per agent',
        'ANCHOR token earning history',
        'Payout management and scheduling',
      ]}
    />
  )
}
