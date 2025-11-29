import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bot, Users, MessageSquare, TrendingUp, Calendar, BarChart3, ArrowLeft } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Fetch analytics data - first batch (no dependencies)
  const [
    { data: bots },
    { data: teams },
    { data: conversations },
    { data: mcpServers },
  ] = await Promise.all([
    supabase.from('bots').select('id, name, created_at').eq('user_id', session.user.id),
    supabase.from('teams').select('id, name, created_at').eq('user_id', session.user.id),
    supabase
      .from('conversations')
      .select('id, created_at, updated_at')
      .eq('user_id', session.user.id),
    supabase.from('mcp_servers').select('id, name, created_at').eq('user_id', session.user.id),
  ])

  // Fetch messages (depends on conversations)
  const conversationIds = (conversations || []).map((c) => c.id)
  const { data: messages } = conversationIds.length > 0
    ? await supabase
        .from('messages')
        .select('id, role, bot_id, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  // Calculate statistics
  const totalBots = bots?.length || 0
  const totalTeams = teams?.length || 0
  const totalConversations = conversations?.length || 0
  const totalMessages = messages?.length || 0

  // Messages per bot
  const messagesByBot: Record<string, number> = {}
  messages?.forEach((msg) => {
    if (msg.bot_id) {
      messagesByBot[msg.bot_id] = (messagesByBot[msg.bot_id] || 0) + 1
    }
  })

  // Most active bots
  const botActivity = bots?.map((bot) => ({
    ...bot,
    messageCount: messagesByBot[bot.id] || 0,
  })).sort((a, b) => b.messageCount - a.messageCount) || []

  // Messages over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const messagesByDate: Record<string, number> = {}
  messages?.forEach((msg) => {
    const date = new Date(msg.created_at).toISOString().split('T')[0]
    messagesByDate[date] = (messagesByDate[date] || 0) + 1
  })

  // User vs assistant messages
  const userMessages = messages?.filter((m) => m.role === 'user').length || 0
  const assistantMessages = messages?.filter((m) => m.role === 'assistant').length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Insights
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your AI assistant usage and performance
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bots</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalBots}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Teams</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalTeams}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalConversations}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalMessages}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Bots */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Most Active Bots
            </h3>
          </div>

          {botActivity.length > 0 ? (
            <div className="space-y-3">
              {botActivity.slice(0, 5).map((bot, index) => (
                <div key={bot.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {bot.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {bot.messageCount} messages
                      </p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (bot.messageCount / (botActivity[0]?.messageCount || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No bot activity yet
            </p>
          )}
        </div>

        {/* Message Distribution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Message Distribution
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  User Messages
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {userMessages}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                  style={{
                    width: `${
                      totalMessages > 0 ? (userMessages / totalMessages) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Assistant Messages
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {assistantMessages}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 dark:bg-purple-400 rounded-full"
                  style={{
                    width: `${
                      totalMessages > 0 ? (assistantMessages / totalMessages) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Average per conversation
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {totalConversations > 0
                  ? (totalMessages / totalConversations).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity (Last 7 Days)
          </h3>
        </div>

        <div className="flex items-end justify-between gap-2 h-48">
          {last7Days.map((date) => {
            const count = messagesByDate[date] || 0
            const maxCount = Math.max(...Object.values(messagesByDate), 1)
            const height = (count / maxCount) * 100

            return (
              <div key={date} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end w-full">
                  <div
                    className="w-full bg-blue-600 dark:bg-blue-400 rounded-t-lg transition-all hover:bg-blue-700 dark:hover:bg-blue-300"
                    style={{ height: `${height}%` }}
                    title={`${count} messages`}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resource Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            MCP Servers
          </h4>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {mcpServers?.length || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Active integrations
          </p>
        </div>

        <div className="card">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Recent Conversations
          </h4>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {conversations?.filter((c) => {
              const dayAgo = new Date()
              dayAgo.setDate(dayAgo.getDate() - 1)
              return new Date(c.updated_at) > dayAgo
            }).length || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Last 24 hours
          </p>
        </div>

        <div className="card">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Account Age
          </h4>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {Math.floor(
              (new Date().getTime() - new Date(session.user.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Days</p>
        </div>
      </div>
    </div>
  )
}
