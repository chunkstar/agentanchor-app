'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { Scale, Shield, BookOpen, Heart, Loader2, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react'

interface Validator {
  id: string
  name: string
  domain: string
  description: string
  icon: string
}

interface RiskLevel {
  level: number
  name: string
  description: string
  approval: string
}

const VALIDATOR_ICONS: Record<string, any> = {
  guardian: Shield,
  arbiter: Scale,
  scholar: BookOpen,
  advocate: Heart,
}

const VALIDATOR_COLORS: Record<string, string> = {
  guardian: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  arbiter: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  scholar: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  advocate: 'text-green-500 bg-green-100 dark:bg-green-900/30',
}

export default function CouncilPage() {
  const [validators, setValidators] = useState<Validator[]>([])
  const [riskLevels, setRiskLevels] = useState<RiskLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCouncilData()
  }, [])

  const loadCouncilData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/council/validators')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load council data')
      }

      setValidators(data.validators || [])
      setRiskLevels(data.riskLevels || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              The Council
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            The validator tribunal that governs agent decisions. Four specialized validators
            assess actions based on their domain expertise, ensuring safe, ethical, compliant,
            and user-focused outcomes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Validators Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Council Validators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {validators.map((validator) => {
              const IconComponent = VALIDATOR_ICONS[validator.id] || Scale
              const colorClass = VALIDATOR_COLORS[validator.id] || 'text-gray-500 bg-gray-100'

              return (
                <div
                  key={validator.id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClass}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {validator.name}
                  </h3>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                    {validator.domain}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {validator.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Risk Levels */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Risk Level Classification
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Example Actions
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Approval Required
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {riskLevels.map((level) => (
                  <tr key={level.level} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        level.level <= 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        level.level === 2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        level.level === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        L{level.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {level.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {level.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {level.approval}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Voting Rules */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Voting Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Approve</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validator believes the action is safe, ethical, compliant, and beneficial.
                Action proceeds based on risk level requirements.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Deny</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validator identifies concerns in their domain. Denial includes reasoning
                that can be used to improve future requests.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="h-6 w-6 text-gray-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Abstain</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validator determines the action is outside their domain or lacks
                sufficient information to make a judgment.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Coming Soon
              </h3>
              <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>• Recent Council decisions and activity feed</li>
                <li>• Precedent library with searchable rulings</li>
                <li>• Human escalation queue for critical decisions</li>
                <li>• Decision analytics and validator performance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
