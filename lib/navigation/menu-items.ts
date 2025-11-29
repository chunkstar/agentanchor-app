import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  Scale,
  Eye,
  Store,
  Link2,
  Wallet,
  Briefcase,
  BarChart3,
  Settings,
  HelpCircle,
  LucideIcon,
} from 'lucide-react'

export type UserRole = 'trainer' | 'consumer' | 'both'

export interface MenuItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  roles?: UserRole[] // If undefined, shown to all roles
  badge?: string | number
  section: 'main' | 'management' | 'consumer' | 'system'
}

export interface MenuSection {
  id: string
  label: string
  items: MenuItem[]
}

export const menuItems: MenuItem[] = [
  // Main Section - All users
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'main',
  },
  {
    id: 'agents',
    label: 'Agents',
    href: '/agents',
    icon: Bot,
    section: 'main',
  },
  {
    id: 'academy',
    label: 'Academy',
    href: '/academy',
    icon: GraduationCap,
    section: 'main',
  },
  {
    id: 'council',
    label: 'Council',
    href: '/council',
    icon: Scale,
    section: 'main',
  },
  {
    id: 'observer',
    label: 'Observer',
    href: '/observer',
    icon: Eye,
    section: 'main',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    href: '/marketplace',
    icon: Store,
    section: 'main',
  },
  {
    id: 'truth-chain',
    label: 'Truth Chain',
    href: '/truth-chain',
    icon: Link2,
    section: 'main',
  },

  // Management Section - Trainers only
  {
    id: 'earnings',
    label: 'Earnings',
    href: '/earnings',
    icon: Wallet,
    roles: ['trainer', 'both'],
    section: 'management',
  },
  {
    id: 'storefront',
    label: 'Storefront',
    href: '/storefront',
    icon: Briefcase,
    roles: ['trainer', 'both'],
    section: 'management',
  },

  // Consumer Section - Consumers only
  {
    id: 'portfolio',
    label: 'Portfolio',
    href: '/portfolio',
    icon: Briefcase,
    roles: ['consumer', 'both'],
    section: 'consumer',
  },
  {
    id: 'usage',
    label: 'Usage',
    href: '/usage',
    icon: BarChart3,
    roles: ['consumer', 'both'],
    section: 'consumer',
  },

  // System Section - All users
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    section: 'system',
  },
  {
    id: 'help',
    label: 'Help',
    href: '/help',
    icon: HelpCircle,
    section: 'system',
  },
]

/**
 * Filter menu items based on user role
 */
export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  return menuItems.filter((item) => {
    if (!item.roles) return true // No role restriction
    return item.roles.includes(role)
  })
}

/**
 * Group menu items by section
 */
export function getMenuSections(role: UserRole): MenuSection[] {
  const items = getMenuItemsForRole(role)

  const sections: MenuSection[] = [
    {
      id: 'main',
      label: 'Main',
      items: items.filter((i) => i.section === 'main'),
    },
  ]

  // Add management section for trainers
  const managementItems = items.filter((i) => i.section === 'management')
  if (managementItems.length > 0) {
    sections.push({
      id: 'management',
      label: 'Management',
      items: managementItems,
    })
  }

  // Add consumer section for consumers
  const consumerItems = items.filter((i) => i.section === 'consumer')
  if (consumerItems.length > 0) {
    sections.push({
      id: 'consumer',
      label: 'My Account',
      items: consumerItems,
    })
  }

  // Add system section
  sections.push({
    id: 'system',
    label: 'System',
    items: items.filter((i) => i.section === 'system'),
  })

  return sections
}
