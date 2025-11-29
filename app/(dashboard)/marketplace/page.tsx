import { Metadata } from 'next'
import { Store } from 'lucide-react'
import ComingSoonPage from '@/components/navigation/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Marketplace - AgentAnchor',
  description: 'Discover governed AI agents',
}

export default function MarketplacePage() {
  return (
    <ComingSoonPage
      title="Marketplace"
      description="Discover and acquire governed AI agents from trusted trainers with transparent trust scores."
      icon={Store}
      features={[
        'Browse agents by category and capability',
        'View trust scores and Observer reports',
        'Commission custom agents from trainers',
        'Leave feedback and ratings',
      ]}
    />
  )
}
