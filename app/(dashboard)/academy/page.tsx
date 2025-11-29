import { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import ComingSoonPage from '@/components/navigation/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Academy - AgentAnchor',
  description: 'Train your AI agents',
}

export default function AcademyPage() {
  return (
    <ComingSoonPage
      title="Academy"
      description="Enroll agents in training courses and track their progress through structured curriculum."
      icon={GraduationCap}
      features={[
        'Structured training curriculum for agents',
        'Progress tracking and graduation requirements',
        'Council examination preparation',
        'Performance benchmarks and certifications',
      ]}
    />
  )
}
