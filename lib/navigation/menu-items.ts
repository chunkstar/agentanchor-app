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
  Sparkles,
  Shield,
  FlaskConical,
  GitCompare,
} from 'lucide-react'

export type UserRole = 'trainer' | 'consumer' | 'both'

export interface MenuItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  roles?: UserRole[] // If undefined, shown to all roles
  badge?: string | number
  section: 'home' | 'discover' | 'create' | 'govern' | 'grow' | 'system'
}

export interface MenuSection {
  id: string
  label: string
  items: MenuItem[]
}

// User Journey Navigation:
// 1. HOME - Your command center
// 2. DISCOVER - Find trusted agents
// 3. CREATE - Build & train your agents
// 4. GOVERN - Oversight & verification
// 5. GROW - Earnings, usage, business
// 6. SYSTEM - Settings & help

export const menuItems: MenuItem[] = [
  // === HOME ===
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'home',
  },

  // === DISCOVER - Find agents ===
  {
    id: 'marketplace',
    label: 'Marketplace',
    href: '/marketplace',
    icon: Sparkles,
    section: 'discover',
  },
  {
    id: 'portfolio',
    label: 'My Portfolio',
    href: '/portfolio',
    icon: Briefcase,
    section: 'discover',
  },

  // === CREATE - Build & train ===
  {
    id: 'my-agents',
    label: 'My Agents',
    href: '/agents',
    icon: Bot,
    section: 'create',
  },
  {
    id: 'sandbox',
    label: 'Sandbox',
    href: '/sandbox',
    icon: FlaskConical,
    section: 'create',
  },
  {
    id: 'shadow-training',
    label: 'Shadow Training',
    href: '/shadow-training',
    icon: GitCompare,
    section: 'create',
  },
  {
    id: 'academy',
    label: 'Academy',
    href: '/academy',
    icon: GraduationCap,
    section: 'create',
  },
  {
    id: 'storefront',
    label: 'Storefront',
    href: '/storefront',
    icon: Store,
    roles: ['trainer', 'both'],
    section: 'create',
  },

  // === GOVERN - Oversight & verification ===
  {
    id: 'council',
    label: 'Council',
    href: '/council',
    icon: Scale,
    section: 'govern',
  },
  {
    id: 'observer',
    label: 'Observer',
    href: '/observer',
    icon: Eye,
    section: 'govern',
  },
  {
    id: 'truth-chain',
    label: 'Truth Chain',
    href: '/truth-chain',
    icon: Link2,
    section: 'govern',
  },

  // === GROW - Business & analytics ===
  {
    id: 'earnings',
    label: 'Earnings',
    href: '/earnings',
    icon: Wallet,
    roles: ['trainer', 'both'],
    section: 'grow',
  },
  {
    id: 'usage',
    label: 'Usage',
    href: '/usage',
    icon: BarChart3,
    section: 'grow',
  },

  // === SYSTEM ===
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
 * Group menu items by section - User Journey based
 */
export function getMenuSections(role: UserRole): MenuSection[] {
  const items = getMenuItemsForRole(role)

  const sections: MenuSection[] = []

  // Home - always first, no label needed
  const homeItems = items.filter((i) => i.section === 'home')
  if (homeItems.length > 0) {
    sections.push({
      id: 'home',
      label: '',
      items: homeItems,
    })
  }

  // Discover
  const discoverItems = items.filter((i) => i.section === 'discover')
  if (discoverItems.length > 0) {
    sections.push({
      id: 'discover',
      label: 'Discover',
      items: discoverItems,
    })
  }

  // Create
  const createItems = items.filter((i) => i.section === 'create')
  if (createItems.length > 0) {
    sections.push({
      id: 'create',
      label: 'Create',
      items: createItems,
    })
  }

  // Govern
  const governItems = items.filter((i) => i.section === 'govern')
  if (governItems.length > 0) {
    sections.push({
      id: 'govern',
      label: 'Govern',
      items: governItems,
    })
  }

  // Grow
  const growItems = items.filter((i) => i.section === 'grow')
  if (growItems.length > 0) {
    sections.push({
      id: 'grow',
      label: 'Grow',
      items: growItems,
    })
  }

  // System - always last
  const systemItems = items.filter((i) => i.section === 'system')
  if (systemItems.length > 0) {
    sections.push({
      id: 'system',
      label: 'System',
      items: systemItems,
    })
  }

  return sections
}
