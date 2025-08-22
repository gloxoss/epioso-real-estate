'use client'

import { ReactNode } from 'react'
import {
  LucideIcon,
  Building2,
  Home,
  Users,
  FileText,
  CreditCard,
  Wrench,
  Upload,
  Search,
  AlertTriangle
} from 'lucide-react'

type IconName = 'Building2' | 'Home' | 'Users' | 'FileText' | 'CreditCard' | 'Wrench' | 'Upload' | 'Search' | 'AlertTriangle'

interface EmptyStateProps {
  icon: IconName | LucideIcon
  title: string
  description: string
  action?: ReactNode
}

function getIconComponent(icon: IconName | LucideIcon): LucideIcon {
  if (typeof icon === 'string') {
    switch (icon) {
      case 'Building2': return Building2
      case 'Home': return Home
      case 'Users': return Users
      case 'FileText': return FileText
      case 'CreditCard': return CreditCard
      case 'Wrench': return Wrench
      case 'Upload': return Upload
      case 'Search': return Search
      case 'AlertTriangle': return AlertTriangle
      default: return AlertTriangle
    }
  }
  return icon
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const Icon = getIconComponent(icon)

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
