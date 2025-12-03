'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  Eye,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  MessageSquare,
  ShoppingCart,
  RefreshCw,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

interface TrainerStats {
  total_agents: number
  active_agents: number
  training_agents: number
  published_agents: number
  total_earnings: number
  available_earnings: number
  this_month_earnings: number
  average_trust_score: number
  total_acquisitions: number
  pending_escalations: number
  pending_complaints: number
}

interface ConsumerStats {
  acquired_agents: number
  active_acquisitions: number
  total_tasks: number
  this_month_tasks: number
  total_spent: number
  this_month_spent: number
  active_agents_count: number
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  agent_id?: string
  agent_name?: string
  created_at: string
}

export default function DashboardPage() {
  const [role, setRole] = useState<'trainer' | 'consumer'>('trainer')
  const [stats, setStats] = useState<TrainerStats | ConsumerStats | null>(null)
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [role])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?role=${role}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setActivity(data.activity || [])
        if (data.preferences?.active_role && !role) {
          setRole(data.preferences.active_role)
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleRole() {
    const newRole = role === 'trainer' ? 'consumer' : 'trainer'
    setRole(newRole)

    // Persist preference
    try {
      await fetch('/api/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_role: newRole }),
      })
    } catch (err) {
      console.error('Failed to save role preference:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Role Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-blue-400" />
            Dashboard
          </h1>
          <p className="text-neutral-400 mt-1">
            Your AI governance command center
          </p>
        </div>

        {/* Role Toggle (FR129) */}
        <button
          onClick={toggleRole}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          {role === 'trainer' ? (
            <ToggleRight className="w-5 h-5 text-blue-400" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-green-400" />
          )}
          <span className="text-neutral-100">
            {role === 'trainer' ? 'Trainer View' : 'Consumer View'}
          </span>
        </button>
      </div>

      {/* Stats Grid */}
      {role === 'trainer' ? (
        <TrainerDashboard stats={stats as TrainerStats} />
      ) : (
        <ConsumerDashboard stats={stats as ConsumerStats} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'trainer' ? (
          <>
            <QuickActionCard
              title="Create Agent"
              description="Start training a new AI agent"
              href="/agents/new"
              icon={Bot}
              color="blue"
            />
            <QuickActionCard
              title="Academy"
              description="Manage agent training"
              href="/academy"
              icon={GraduationCap}
              color="purple"
            />
            <QuickActionCard
              title="Marketplace"
              description="Manage your listings"
              href="/marketplace"
              icon={ShoppingCart}
              color="green"
            />
            <QuickActionCard
              title="Earnings"
              description="View your earnings"
              href="/earnings"
              icon={DollarSign}
              color="yellow"
            />
          </>
        ) : (
          <>
            <QuickActionCard
              title="Browse Agents"
              description="Find new agents to use"
              href="/marketplace"
              icon={ShoppingCart}
              color="green"
            />
            <QuickActionCard
              title="My Agents"
              description="View acquired agents"
              href="/agents"
              icon={Bot}
              color="blue"
            />
            <QuickActionCard
              title="Usage"
              description="Track your usage"
              href="/usage"
              icon={Activity}
              color="purple"
            />
            <QuickActionCard
              title="Feedback"
              description="Leave reviews"
              href="/feedback"
              icon={MessageSquare}
              color="yellow"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Recent Activity
        </h2>

        {activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutDashboard className="w-12 h-12 text-neutral-600 mb-4" />
            <h3 className="text-lg font-medium text-neutral-300">
              No recent activity
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Your agent activity and governance events will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <ActivityIcon type={item.type} />
                  <div>
                    <p className="text-neutral-200 font-medium">{item.title}</p>
                    <p className="text-sm text-neutral-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  {item.agent_id && (
                    <Link
                      href={`/agents/${item.agent_id}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TrainerDashboard({ stats }: { stats: TrainerStats | null }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="My Agents"
        value={stats.total_agents.toString()}
        subtitle={`${stats.active_agents} active`}
        icon={Bot}
        color="blue"
      />
      <StatCard
        title="This Month"
        value={`$${stats.this_month_earnings.toFixed(2)}`}
        subtitle={`$${stats.available_earnings.toFixed(2)} available`}
        icon={DollarSign}
        color="green"
      />
      <StatCard
        title="Avg Trust Score"
        value={stats.average_trust_score.toString()}
        subtitle={`${stats.published_agents} published`}
        icon={TrendingUp}
        color="purple"
      />
      <StatCard
        title="Acquisitions"
        value={stats.total_acquisitions.toString()}
        subtitle={
          stats.pending_escalations > 0
            ? `${stats.pending_escalations} escalations`
            : 'No pending issues'
        }
        icon={Users}
        color="yellow"
        alert={stats.pending_escalations > 0 || stats.pending_complaints > 0}
      />
    </div>
  )
}

function ConsumerDashboard({ stats }: { stats: ConsumerStats | null }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Acquired Agents"
        value={stats.acquired_agents.toString()}
        subtitle={`${stats.active_acquisitions} active`}
        icon={Bot}
        color="blue"
      />
      <StatCard
        title="Tasks This Month"
        value={stats.this_month_tasks.toLocaleString()}
        subtitle={`${stats.total_tasks.toLocaleString()} total`}
        icon={Activity}
        color="purple"
      />
      <StatCard
        title="Spent This Month"
        value={`$${stats.this_month_spent.toFixed(2)}`}
        subtitle={`$${stats.total_spent.toFixed(2)} total`}
        icon={DollarSign}
        color="green"
      />
      <StatCard
        title="Active Agents"
        value={stats.active_agents_count.toString()}
        subtitle="Ready to use"
        icon={Users}
        color="yellow"
      />
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  alert,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'yellow'
  alert?: boolean
}) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  }

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-neutral-500">{title}</span>
        <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
      </div>
      <p className="text-2xl font-bold text-neutral-100">{value}</p>
      <p className={`text-sm mt-1 ${alert ? 'text-yellow-400' : 'text-neutral-500'}`}>
        {alert && <AlertTriangle className="w-3 h-3 inline mr-1" />}
        {subtitle}
      </p>
    </div>
  )
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  color,
}: {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'yellow'
}) {
  const colorClasses = {
    blue: 'border-blue-800 hover:border-blue-600 hover:bg-blue-900/20',
    green: 'border-green-800 hover:border-green-600 hover:bg-green-900/20',
    purple: 'border-purple-800 hover:border-purple-600 hover:bg-purple-900/20',
    yellow: 'border-yellow-800 hover:border-yellow-600 hover:bg-yellow-900/20',
  }

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  }

  return (
    <Link
      href={href}
      className={`block p-4 rounded-lg border-2 border-dashed transition-colors ${colorClasses[color]}`}
    >
      <Icon className={`w-6 h-6 ${iconColors[color]} mb-2`} />
      <h3 className="font-medium text-neutral-100">{title}</h3>
      <p className="text-sm text-neutral-500 mt-1">{description}</p>
    </Link>
  )
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: React.ElementType; color: string }> = {
    agent_created: { icon: Bot, color: 'text-blue-400' },
    training_started: { icon: GraduationCap, color: 'text-purple-400' },
    graduation: { icon: GraduationCap, color: 'text-green-400' },
    acquisition: { icon: ShoppingCart, color: 'text-green-400' },
    task_completed: { icon: Activity, color: 'text-blue-400' },
    feedback: { icon: MessageSquare, color: 'text-yellow-400' },
    council_decision: { icon: Eye, color: 'text-purple-400' },
    trust_change: { icon: TrendingUp, color: 'text-green-400' },
  }

  const config = icons[type] || { icon: Activity, color: 'text-neutral-400' }
  const Icon = config.icon

  return (
    <div className={`p-2 rounded-lg bg-neutral-800 ${config.color}`}>
      <Icon className="w-4 h-4" />
    </div>
  )
}
