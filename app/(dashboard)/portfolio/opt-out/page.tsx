'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AlertTriangle, Shield, ArrowLeft, CheckCircle, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface OwnershipChange {
  id: string
  agentId: string
  agentName: string
  previousOwnerName: string
  newOwnerName: string
  changeType: string
  noticeDate: string
  effectiveDate: string
}

interface ProtectionRequest {
  id: string
  agentName: string
  type: string
  status: string
  reason: string
  createdAt: string
  resolvedAt?: string
}

export default function OptOutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const agentId = searchParams.get('agent')
  const changeId = searchParams.get('change')

  const [pendingChanges, setPendingChanges] = useState<OwnershipChange[]>([])
  const [requests, setRequests] = useState<ProtectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [reason, setReason] = useState('')
  const [selectedChange, setSelectedChange] = useState<OwnershipChange | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (changeId && pendingChanges.length > 0) {
      const change = pendingChanges.find(c => c.id === changeId)
      if (change) setSelectedChange(change)
    }
  }, [changeId, pendingChanges])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load pending ownership changes
      const changesRes = await fetch('/api/protection/changes')
      if (changesRes.ok) {
        const data = await changesRes.json()
        setPendingChanges(data.changes || [])
      }

      // Load existing requests
      const requestsRes = await fetch('/api/protection/requests')
      if (requestsRes.ok) {
        const data = await requestsRes.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setLoading(false)
  }

  const handleOptOut = async () => {
    if (!selectedChange || !reason) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/protection/opt-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedChange.agentId,
          reason,
          ownershipChangeId: selectedChange.id,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit opt-out')
      }
    } catch (error) {
      console.error('Failed to submit:', error)
    }
    setSubmitting(false)
  }

  const getDaysRemaining = (effectiveDate: string) => {
    const remaining = new Date(effectiveDate).getTime() - Date.now()
    return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container py-8 max-w-3xl">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Opt-Out Submitted
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your request to opt out has been submitted and will be processed automatically.
              You will no longer be charged for this agent.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/portfolio')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Button>
              <Button onClick={() => {
                setSuccess(false)
                setSelectedChange(null)
                setReason('')
              }}>
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/portfolio"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="h-8 w-8 text-[#1E40AF]" />
          Client Protection
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your rights under the Client Bill of Rights
        </p>
      </div>

      {/* Client Bill of Rights */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-[#1E40AF] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Right to Be Informed:</strong> Know who built and maintains your agents</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Right to Opt Out:</strong> Walk away from any agent at ownership changes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Right to Platform Protection:</strong> Request platform maintenance if needed</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Right to Continuity:</strong> Service quality guaranteed during transitions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Right to Walk Away:</strong> No penalty, no strings attached</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Pending Ownership Changes */}
      {pendingChanges.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Pending Ownership Changes
            </CardTitle>
            <CardDescription>
              These agents you use are changing ownership. You may opt out before the effective date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingChanges.map((change) => {
                const daysRemaining = getDaysRemaining(change.effectiveDate)
                return (
                  <div
                    key={change.id}
                    className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedChange?.id === change.id
                        ? 'border-[#1E40AF] bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedChange(change)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {change.agentName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Ownership transferring from <strong>{change.previousOwnerName}</strong> to{' '}
                          <strong>{change.newOwnerName}</strong>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Notice received: {new Date(change.noticeDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={
                        daysRemaining <= 7
                          ? 'bg-red-100 text-red-800'
                          : daysRemaining <= 14
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        <Clock className="h-3 w-3 mr-1" />
                        {daysRemaining} days left
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opt-Out Form */}
      {selectedChange && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Opt Out of {selectedChange.agentName}</CardTitle>
            <CardDescription>
              You are exercising your right to walk away from this agent due to ownership change.
              This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                  What happens when you opt out:
                </h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <li>- Your access to this agent will be terminated immediately</li>
                  <li>- Any pending tasks will be cancelled</li>
                  <li>- You will not be charged going forward</li>
                  <li>- This is recorded on the Truth Chain for transparency</li>
                </ul>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Reason for opting out (optional)
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Help us understand why you're leaving..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedChange(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleOptOut}
                  disabled={submitting}
                  variant="destructive"
                >
                  {submitting ? 'Processing...' : 'Confirm Opt-Out'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Pending Changes */}
      {pendingChanges.length === 0 && (
        <Card className="mb-8">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No Pending Changes
            </h3>
            <p className="text-gray-500 mt-1">
              All your agents are in good standing with no ownership changes pending.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Request History */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.type === 'opt_out' ? 'Opt-Out' : 'Platform Protection'} - {request.agentName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={
                    request.status === 'completed' || request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
