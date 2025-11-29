import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { LayoutDashboard, Bot, GraduationCap, Eye, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard - AgentAnchor',
  description: 'Your AgentAnchor governance dashboard',
}

async function getStats() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('auth_user_id', user.id)
    .single()

  return {
    userName: profile?.full_name || 'User',
    role: profile?.role || 'consumer',
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const welcomeMessage = stats
    ? `Welcome back, ${stats.userName}!`
    : 'Welcome to AgentAnchor'

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {welcomeMessage}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Your AI governance command center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Agents"
          value="0"
          change="+0"
          icon={Bot}
          color="blue"
        />
        <StatCard
          title="Academy Progress"
          value="0%"
          change="0 courses"
          icon={GraduationCap}
          color="purple"
        />
        <StatCard
          title="Observer Events"
          value="0"
          change="Today"
          icon={Eye}
          color="green"
        />
        <StatCard
          title="Trust Score"
          value="--"
          change="Not calculated"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Create Agent"
            description="Start training a new AI agent"
            href="/agents/new"
            color="blue"
          />
          <QuickAction
            title="Browse Academy"
            description="Explore training courses"
            href="/academy"
            color="purple"
          />
          <QuickAction
            title="View Marketplace"
            description="Discover governed agents"
            href="/marketplace"
            color="green"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LayoutDashboard className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No recent activity
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your agent activity and governance events will appear here
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  change: string
  icon: React.ElementType
  color: 'blue' | 'purple' | 'green' | 'amber'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          {change}
        </span>
      </div>
    </div>
  )
}

function QuickAction({
  title,
  description,
  href,
  color,
}: {
  title: string
  description: string
  href: string
  color: 'blue' | 'purple' | 'green'
}) {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20',
    purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-600 dark:hover:bg-purple-900/20',
    green: 'border-green-200 hover:border-green-400 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-600 dark:hover:bg-green-900/20',
  }

  return (
    <a
      href={href}
      className={`block rounded-lg border-2 border-dashed p-4 transition-colors ${colorClasses[color]}`}
    >
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </a>
  )
}
