import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Building2, Eye, AlertTriangle } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n/config'

type SnapshotItem = {
  id: string
  name: string
  imageUrl?: string | null
  units: number
  occupied: number
  vacant: number
  occupancyPct: number
}

interface PropertiesSnapshotTableProps {
  items: SnapshotItem[]
  dictionary?: Dictionary
  locale?: string
}

export default function PropertiesSnapshotTable({ items, dictionary, locale = 'fr' }: PropertiesSnapshotTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">No properties yet</p>
        <Button asChild size="sm">
          <Link href="/properties/new">Add your first property</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((p) => (
        <Link key={p.id} href={`/${locale}/properties/${p.id}`} className="rounded-md border p-4 hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <div className="font-medium truncate">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.units} {dictionary?.dashboard?.units || "units"}</div>
          </div>
          <div className="mt-2">
            <Progress value={p.occupancyPct} />
            <div className="mt-1 text-xs text-muted-foreground">
              {p.occupied} {dictionary?.dashboard?.occupied || "occupied"} · {p.vacant} {dictionary?.dashboard?.vacant || "vacant"} ({p.occupancyPct.toFixed(1)}%)
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
