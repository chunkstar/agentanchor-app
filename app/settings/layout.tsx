import { Metadata } from 'next'
import SettingsSidebar from '@/components/settings/SettingsSidebar'

export const metadata: Metadata = {
  title: 'Settings - AgentAnchor',
  description: 'Manage your AgentAnchor profile and preferences',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64">
            <SettingsSidebar />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
