import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatMoney, formatDate } from '@/lib/format'
import { AlertTriangle, Clock } from 'lucide-react'

interface ARAgingData {
  tenantName: string
  unitNumber: string
  propertyName: string
  totalOwed: number
  current: number
  days30: number
  days60: number
  days90Plus: number
  lastPayment?: Date
}

interface ARAgingTableProps {
  data: ARAgingData[]
}

function getAgingColor(days: number) {
  if (days >= 90) return 'bg-red-100 text-red-800'
  if (days >= 60) return 'bg-orange-100 text-orange-800'
  if (days >= 30) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

export function ARAgingTable({ data }: ARAgingTableProps) {
  const totalOwed = data.reduce((sum, item) => sum + item.totalOwed, 0)
  const total30 = data.reduce((sum, item) => sum + item.days30, 0)
  const total60 = data.reduce((sum, item) => sum + item.days60, 0)
  const total90Plus = data.reduce((sum, item) => sum + item.days90Plus, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Accounts Receivable Aging
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total Outstanding: {formatMoney(totalOwed)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Row */}
        <div className="grid grid-cols-5 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Current</div>
            <div className="text-lg font-semibold text-green-600">
              {formatMoney(totalOwed - total30 - total60 - total90Plus)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">1-30 Days</div>
            <div className="text-lg font-semibold text-yellow-600">
              {formatMoney(total30)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">31-60 Days</div>
            <div className="text-lg font-semibold text-orange-600">
              {formatMoney(total60)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">61-90 Days</div>
            <div className="text-lg font-semibold text-red-600">
              {formatMoney(total90Plus)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Total</div>
            <div className="text-lg font-semibold">
              {formatMoney(totalOwed)}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Property</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">1-30 Days</TableHead>
              <TableHead className="text-right">31-60 Days</TableHead>
              <TableHead className="text-right">61-90 Days</TableHead>
              <TableHead className="text-right">Total Owed</TableHead>
              <TableHead>Last Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No outstanding receivables
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => {
                const current = item.totalOwed - item.days30 - item.days60 - item.days90Plus
                const hasOverdue = item.days30 > 0 || item.days60 > 0 || item.days90Plus > 0
                
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {hasOverdue && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        <span className="font-medium">{item.tenantName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.unitNumber}</TableCell>
                    <TableCell>{item.propertyName}</TableCell>
                    <TableCell className="text-right">
                      {current > 0 ? formatMoney(current) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.days30 > 0 ? (
                        <Badge className={getAgingColor(30)}>
                          {formatMoney(item.days30)}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.days60 > 0 ? (
                        <Badge className={getAgingColor(60)}>
                          {formatMoney(item.days60)}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.days90Plus > 0 ? (
                        <Badge className={getAgingColor(90)}>
                          {formatMoney(item.days90Plus)}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(item.totalOwed)}
                    </TableCell>
                    <TableCell>
                      {item.lastPayment ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDate(item.lastPayment.toISOString())}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
