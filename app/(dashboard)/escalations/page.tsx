'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, User, CheckCircle, XCircle, Eye, Shield, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface Escalation {
  id: string
  agentName: string
  agentId: string
  status: 'pending' | 'assigned' | 'in_review' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'critical'
  reason: string
  context: {
    actionType: string
    actionDetails: string
    riskLevel: number
    councilVotes?: Record<string, string>
  }
  createdAt: string
  expiresAt?: string
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_review: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const riskLabels = ['Minimal', 'Low', 'Medium', 'High', 'Critical']

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_review'>('pending')
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null)
  const [resolveDialog, setResolveDialog] = useState(false)
  const [resolution, setResolution] = useState<'approved' | 'rejected'>('approved')
  const [resolutionReason, setResolutionReason] = useState('')
  const [createPrecedent, setCreatePrecedent] = useState(false)
  const [stats, setStats] = useState({ pending: 0, inReview: 0, resolvedToday: 0, avgHours: 0 })

  useEffect(() => {
    loadEscalations()
    loadStats()
  }, [filter])

  const loadEscalations = async () => {
    setLoading(true)
    try {
      const statusFilter = filter === 'all' ? '' : `?status=${filter}`
      const res = await fetch(`/api/escalations${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        setEscalations(data.escalations || [])
      }
    } catch (error) {
      console.error('Failed to load escalations:', error)
      // Mock data for development
      setEscalations([
        {
          id: '1',
          agentName: 'DataBot Pro',
          agentId: 'agent-1',
          status: 'pending',
          priority: 'critical',
          reason: 'Unanimous Council approval required for database deletion',
          context: {
            actionType: 'data_deletion',
            actionDetails: 'Delete all user records from backup table',
            riskLevel: 4,
            councilVotes: {
              guardian: 'approve',
              arbiter: 'approve',
              scholar: 'deny',
              advocate: 'approve',
            },
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 70 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          agentName: 'CommsAgent',
          agentId: 'agent-2',
          status: 'pending',
          priority: 'high',
          reason: 'Mass email to 10,000 users requires human confirmation',
          context: {
            actionType: 'mass_communication',
            actionDetails: 'Send product update newsletter',
            riskLevel: 3,
          },
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ])
    }
    setLoading(false)
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/escalations/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // Use mock stats
      setStats({ pending: 5, inReview: 2, resolvedToday: 3, avgHours: 4 })
    }
  }

  const handleStartReview = async (escalation: Escalation) => {
    setSelectedEscalation(escalation)
  }

  const handleResolve = async () => {
    if (!selectedEscalation || !resolutionReason) return

    try {
      await fetch(`/api/escalations/${selectedEscalation.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution,
          resolutionReason,
          createsPrecedent: createPrecedent,
        }),
      })
      setResolveDialog(false)
      setSelectedEscalation(null)
      setResolutionReason('')
      setCreatePrecedent(false)
      loadEscalations()
      loadStats()
    } catch (error) {
      console.error('Failed to resolve:', error)
    }
  }

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null
    const remaining = new Date(expiresAt).getTime() - Date.now()
    if (remaining <= 0) return 'Expired'
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    return `${hours}h remaining`
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-[#1E40AF]" />
            Human Escalation Queue
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and resolve Level 4 decisions requiring human oversight
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inReview}</p>
                <p className="text-sm text-gray-500">In Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolvedToday}</p>
                <p className="text-sm text-gray-500">Resolved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgHours}h</p>
                <p className="text-sm text-gray-500">Avg. Resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Escalations</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Escalation List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading escalations...</div>
        ) : escalations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
              <p className="text-gray-500">No escalations require your attention.</p>
            </CardContent>
          </Card>
        ) : (
          escalations.map((escalation) => (
            <Card key={escalation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={priorityColors[escalation.priority]}>
                        {escalation.priority.toUpperCase()}
                      </Badge>
                      <Badge className={statusColors[escalation.status]}>
                        {escalation.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Risk Level {escalation.context.riskLevel}: {riskLabels[escalation.context.riskLevel]}
                      </span>
                      {escalation.expiresAt && (
                        <span className="text-sm text-orange-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeRemaining(escalation.expiresAt)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {escalation.agentName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{escalation.reason}</p>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Action Type:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {escalation.context.actionType.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Details:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {escalation.context.actionDetails}
                          </span>
                        </div>
                      </div>

                      {escalation.context.councilVotes && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-500">Council Votes:</span>
                          <div className="flex gap-3 mt-2">
                            {Object.entries(escalation.context.councilVotes).map(([validator, vote]) => (
                              <span
                                key={validator}
                                className={`text-xs px-2 py-1 rounded ${
                                  vote === 'approve'
                                    ? 'bg-green-100 text-green-700'
                                    : vote === 'deny'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {validator}: {vote}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Created {new Date(escalation.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      onClick={() => handleStartReview(escalation)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedEscalation && !resolveDialog} onOpenChange={(open) => !open && setSelectedEscalation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Escalation</DialogTitle>
            <DialogDescription>
              Review the details and make a decision on this escalation.
            </DialogDescription>
          </DialogHeader>

          {selectedEscalation && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={priorityColors[selectedEscalation.priority]}>
                  {selectedEscalation.priority.toUpperCase()}
                </Badge>
                <span className="font-medium">{selectedEscalation.agentName}</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">Reason for Escalation</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedEscalation.reason}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">Action Details</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Type:</strong> {selectedEscalation.context.actionType}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Details:</strong> {selectedEscalation.context.actionDetails}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Risk Level:</strong> {selectedEscalation.context.riskLevel} ({riskLabels[selectedEscalation.context.riskLevel]})
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedEscalation(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setResolution('rejected')
                setResolveDialog(true)
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setResolution('approved')
                setResolveDialog(true)
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog open={resolveDialog} onOpenChange={setResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolution === 'approved' ? 'Approve' : 'Reject'} Escalation
            </DialogTitle>
            <DialogDescription>
              Provide a reason for your decision. This will be recorded on the Truth Chain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Reason for Decision *
              </label>
              <Textarea
                value={resolutionReason}
                onChange={(e) => setResolutionReason(e.target.value)}
                placeholder={`Why are you ${resolution === 'approved' ? 'approving' : 'rejecting'} this action?`}
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="precedent"
                checked={createPrecedent}
                onCheckedChange={(checked) => setCreatePrecedent(checked as boolean)}
              />
              <label htmlFor="precedent" className="text-sm text-gray-700 dark:text-gray-300">
                Create precedent from this decision
              </label>
            </div>

            {createPrecedent && (
              <p className="text-xs text-gray-500">
                This decision will be used as a reference for similar future cases.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!resolutionReason}
              className={resolution === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={resolution === 'rejected' ? 'destructive' : 'default'}
            >
              Confirm {resolution === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
