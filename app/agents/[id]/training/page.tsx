'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GraduationCap, Loader2, Trophy, BookOpen } from 'lucide-react'
import ModuleProgress from '@/components/academy/ModuleProgress'
import ModuleContent from '@/components/academy/ModuleContent'

interface Module {
  id: string
  name: string
  description: string
  state: 'completed' | 'current' | 'available' | 'locked'
  score?: number | null
  content?: any
}

interface Enrollment {
  id: string
  status: string
  progress: any
  progress_stats: {
    completed: number
    total: number
    percentage: number
    ready_for_exam: boolean
  }
  curriculum: {
    id: string
    name: string
    description: string
    specialization: string
    difficulty_level: number
    trust_points: number
    certification_points: number
  }
  modules: Module[]
}

interface Agent {
  id: string
  name: string
  status: string
  trust_score: number
  trust_tier: string
}

export default function AgentTrainingPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [activeEnrollment, setActiveEnrollment] = useState<Enrollment | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadTrainingData()
  }, [agentId])

  const loadTrainingData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/agents/${agentId}/training`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load training data')
      }

      setAgent(data.agent)
      setEnrollments(data.enrollments || [])

      // Auto-select active enrollment
      if (data.active_enrollment) {
        setActiveEnrollment(data.active_enrollment)

        // Auto-select current or first available module
        const currentModule = data.active_enrollment.modules.find(
          (m: Module) => m.state === 'current' || m.state === 'available'
        )
        if (currentModule) {
          setSelectedModule(currentModule)
        }
      } else if (data.enrollments?.length > 0) {
        // Select first enrollment if no active one
        const firstEnrollment = data.enrollments[0]
        setActiveEnrollment(firstEnrollment)

        const firstModule = firstEnrollment.modules.find(
          (m: Module) => m.state !== 'locked'
        )
        if (firstModule) {
          setSelectedModule(firstModule)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleClick = async (moduleId: string) => {
    if (!activeEnrollment) return

    const module = activeEnrollment.modules.find(m => m.id === moduleId)
    if (!module || module.state === 'locked') return

    setSelectedModule(module)

    // If module is available (not started), start it
    if (module.state === 'available') {
      try {
        const res = await fetch(`/api/agents/${agentId}/training`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start_module',
            enrollmentId: activeEnrollment.id,
            moduleId,
          }),
        })

        if (res.ok) {
          await loadTrainingData()
        }
      } catch (err) {
        console.error('Error starting module:', err)
      }
    }
  }

  const handleCompleteModule = async () => {
    if (!activeEnrollment || !selectedModule) return

    try {
      setCompleting(true)
      setError(null)

      const res = await fetch(`/api/agents/${agentId}/training/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: activeEnrollment.id,
          moduleId: selectedModule.id,
          score: 100, // For now, auto-pass with 100%
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete module')
      }

      // Show success message
      if (data.curriculum_completed) {
        setSuccessMessage(`Curriculum completed! +${data.trust_awarded} trust points awarded.`)
      } else {
        setSuccessMessage('Module completed!')
      }

      // Reload data
      await loadTrainingData()

      // Auto-select next module
      if (data.next_module) {
        const nextModule = activeEnrollment.modules.find(m => m.id === data.next_module)
        if (nextModule) {
          setSelectedModule({ ...nextModule, state: 'available' })
        }
      }

      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCompleting(false)
    }
  }

  const handleEnrollmentChange = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId)
    if (enrollment) {
      setActiveEnrollment(enrollment)

      const firstModule = enrollment.modules.find(m => m.state !== 'locked')
      setSelectedModule(firstModule || null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Agent not found</p>
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href={`/agents/${agentId}`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agent
          </Link>

          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Training Enrollments
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {agent.name} is not enrolled in any Academy curriculum yet.
            </p>
            <Link href="/academy" className="btn-primary">
              Browse Academy
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href={`/agents/${agentId}`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Agent
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Training: {agent.name}
            </h1>
          </div>

          {/* Enrollment Selector */}
          {enrollments.length > 1 && (
            <select
              value={activeEnrollment?.id || ''}
              onChange={(e) => handleEnrollmentChange(e.target.value)}
              className="input max-w-xs"
            >
              {enrollments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.curriculum.name} ({e.progress_stats.percentage}%)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {successMessage}
          </div>
        )}

        {activeEnrollment && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Module List */}
            <div className="lg:col-span-1">
              <div className="card sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {activeEnrollment.curriculum.name}
                  </h3>
                </div>

                <ModuleProgress
                  modules={activeEnrollment.modules}
                  onModuleClick={handleModuleClick}
                  currentModuleId={selectedModule?.id}
                />

                {/* Rewards Info */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Completion Rewards:
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Trophy className="h-4 w-4" />
                      +{activeEnrollment.curriculum.trust_points} Trust
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Module Details */}
            <div className="lg:col-span-2">
              <div className="card min-h-[500px]">
                {selectedModule ? (
                  <ModuleContent
                    module={selectedModule}
                    onComplete={handleCompleteModule}
                    isCompleting={completing}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a module to begin
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
