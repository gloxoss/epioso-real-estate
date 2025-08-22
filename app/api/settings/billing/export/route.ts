import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithRole } from '@/lib/rbac'
import { billingRepo } from '@/repositories/billing'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthWithRole()
    const { searchParams } = new URL(request.url)
    
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : new Date(new Date().getFullYear(), 0, 1)
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : new Date()
    const format = searchParams.get('format') || 'csv'

    // Get billing data for export
    const [invoices, payments] = await Promise.all([
      billingRepo.listInvoices(session.organizationId, { dateFrom, dateTo }, { page: 1, perPage: 10000 }),
      billingRepo.listPayments(session.organizationId, { dateFrom, dateTo }, { page: 1, perPage: 10000 })
    ])

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Type',
        'Date',
        'Number/Reference',
        'Contact',
        'Amount',
        'Status',
        'Due Date',
        'Property',
        'Unit'
      ].join(',')

      const csvRows = [
        ...invoices.data.map(invoice => [
          'Invoice',
          invoice.issueDate.toISOString().split('T')[0],
          invoice.number,
          invoice.contact?.name || '',
          invoice.amount,
          invoice.status,
          invoice.dueDate.toISOString().split('T')[0],
          invoice.property?.name || '',
          invoice.unit?.unitNumber || ''
        ].join(',')),
        ...payments.data.map(payment => [
          'Payment',
          payment.createdAt.toISOString().split('T')[0],
          payment.reference || '',
          payment.invoice?.contact?.name || '',
          payment.amount,
          'Completed',
          '',
          payment.invoice?.property?.name || '',
          payment.invoice?.unit?.unitNumber || ''
        ].join(','))
      ]

      const csvContent = [csvHeaders, ...csvRows].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="billing-export-${dateFrom.toISOString().split('T')[0]}-to-${dateTo.toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default to JSON format
    return NextResponse.json({
      invoices: invoices.data,
      payments: payments.data,
      summary: {
        totalInvoices: invoices.data.length,
        totalPayments: payments.data.length,
        totalInvoiceAmount: invoices.data.reduce((sum, inv) => sum + Number(inv.amount), 0),
        totalPaymentAmount: payments.data.reduce((sum, pay) => sum + Number(pay.amount), 0),
        dateRange: { from: dateFrom, to: dateTo }
      }
    })

  } catch (error) {
    console.error('Error exporting billing data:', error)
    return NextResponse.json(
      { error: 'Failed to export billing data' },
      { status: 500 }
    )
  }
}
