import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: 'property' | 'unit' | 'contact' | 'invoice' | 'ticket'
  url: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const orgId = (session.user as any).organizationId as string
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.toLowerCase()
    const results: SearchResult[] = []

    // Search Properties
    const properties = await prisma.property.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        address: true,
        units: { select: { id: true } }
      },
      take: 5
    })

    properties.forEach(property => {
      results.push({
        id: property.id,
        title: property.name,
        subtitle: property.address,
        type: 'property',
        url: `/properties/${property.id}`
      })
    })

    // Search Units
    const units = await prisma.unit.findMany({
      where: {
        property: { organizationId: orgId },
        OR: [
          { unitNumber: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        unitNumber: true,
        status: true,
        property: { select: { name: true } }
      },
      take: 5
    })

    units.forEach(unit => {
      results.push({
        id: unit.id,
        title: unit.unitNumber,
        subtitle: `${unit.property.name} • ${unit.status}`,
        type: 'unit',
        url: `/units/${unit.id}`
      })
    })

    // Search Contacts
    const contacts = await prisma.contact.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true
      },
      take: 5
    })

    contacts.forEach(contact => {
      results.push({
        id: contact.id,
        title: contact.name,
        subtitle: `${contact.email} • ${contact.type}`,
        type: 'contact',
        url: `/contacts/${contact.id}`
      })
    })

    // Search Invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { number: { contains: searchTerm, mode: 'insensitive' } },
          { contact: { name: { contains: searchTerm, mode: 'insensitive' } } },
          { unit: { unitNumber: { contains: searchTerm, mode: 'insensitive' } } }
        ]
      },
      select: {
        id: true,
        number: true,
        total: true,
        currency: true,
        status: true,
        contact: { select: { name: true } },
        unit: { select: { unitNumber: true } }
      },
      take: 5
    })

    invoices.forEach(invoice => {
      const subtitle = [
        invoice.contact?.name,
        invoice.unit?.unitNumber,
        `${invoice.total} ${invoice.currency}`,
        invoice.status
      ].filter(Boolean).join(' • ')

      results.push({
        id: invoice.id,
        title: `Invoice ${invoice.number}`,
        subtitle,
        type: 'invoice',
        url: `/billing/invoices/${invoice.id}`
      })
    })

    // Search Maintenance Tickets
    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { property: { name: { contains: searchTerm, mode: 'insensitive' } } },
          { unit: { unitNumber: { contains: searchTerm, mode: 'insensitive' } } }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        property: { select: { name: true } },
        unit: { select: { unitNumber: true } }
      },
      take: 5
    })

    tickets.forEach(ticket => {
      const subtitle = [
        ticket.property.name,
        ticket.unit?.unitNumber,
        ticket.priority,
        ticket.status
      ].filter(Boolean).join(' • ')

      results.push({
        id: ticket.id,
        title: ticket.title,
        subtitle,
        type: 'ticket',
        url: `/maintenance/${ticket.id}`
      })
    })

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchTerm) ? 1 : 0
      const bExact = b.title.toLowerCase().includes(searchTerm) ? 1 : 0
      return bExact - aExact
    })

    return NextResponse.json({ 
      results: sortedResults.slice(0, 20), // Limit to 20 results
      query 
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
