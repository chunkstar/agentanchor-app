import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bot, Users, MessageSquare, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Fetch user's bots, teams, and recent conversations
  const [{ data: bots }, { data: teams }, { data: conversations }] = await Promise.all([
    supabase
      .from('bots')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('teams')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('conversations')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(5),
  ])

  // Check if user has Master Orchestrator
  const { data: orchestrator } = await supabase
    .from('bots')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('name', '🎯 Master Orchestrator')
    .single()

  // Check if user is new (only has orchestrator bot)
  const isNewUser = bots && bots.length === 1 && orchestrator

  return (
    <div className="space-y-8">
      {/* Master Orchestrator Banner */}
      {orchestrator && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {isNewUser ? '🎉 Welcome! Start with your Master Orchestrator' : '💡 Need help? Talk to your Master Orchestrator'}
                </h3>
                <p className="text-purple-100 mt-1">
                  {isNewUser
                    ? 'Get personalized guidance on setting up your first bots, teams, and MCP servers'
                    : 'Get expert guidance on bots, teams, and MCP server setup'}
                </p>
              </div>
            </div>
            <Link
              href="/orchestrator"
              className="bg-white text-purple-600 hover:bg-purple-50 font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {isNewUser ? 'Get Started' : 'Open Orchestrator'}
              <MessageSquare className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back! Manage your AI bots and teams.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                Bots
              </h3>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {bots?.length || 0}
            </span>
          </div>
          <Link href="/bots/new" className="btn-primary w-full">
            <Plus className="h-4 w-4 inline mr-2" />
            Create Bot
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                Teams
              </h3>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {teams?.length || 0}
            </span>
          </div>
          <Link href="/teams/new" className="btn-primary w-full">
            <Plus className="h-4 w-4 inline mr-2" />
            Create Team
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                Conversations
              </h3>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {conversations?.length || 0}
            </span>
          </div>
          <Link href="/chat" className="btn-primary w-full">
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Start Chat
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Bots
          </h3>
          {bots && bots.length > 0 ? (
            <div className="space-y-3">
              {bots.map((bot) => (
                <Link
                  key={bot.id}
                  href={`/bots/${bot.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {bot.name}
                      </h4>
                      {bot.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {bot.description}
                        </p>
                      )}
                    </div>
                    <Bot className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
              <Link
                href="/bots"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-4"
              >
                View all bots →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No bots yet. Create your first AI assistant!
              </p>
              <Link href="/bots/new" className="btn-primary">
                Create Your First Bot
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Teams
          </h3>
          {teams && teams.length > 0 ? (
            <div className="space-y-3">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {team.name}
                      </h4>
                      {team.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
              <Link
                href="/teams"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-4"
              >
                View all teams →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No teams yet. Organize your bots into teams!
              </p>
              <Link href="/teams/new" className="btn-primary">
                Create Your First Team
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
