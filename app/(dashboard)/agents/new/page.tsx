import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AgentForm from '@/components/agents/AgentForm'

export const metadata: Metadata = {
  title: 'Create Agent - AgentAnchor',
  description: 'Create a new AI agent',
}

export default function NewAgentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Create New Agent
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Define your agent's personality, capabilities, and behavior. After creation,
          you can enroll it in the Academy to build trust and earn certification.
        </p>
      </div>

      {/* Form */}
      <AgentForm />
    </div>
  )
}
