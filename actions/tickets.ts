'use server'

import { withAuth } from '@/lib/rbac'
import { ticketsRepo } from '@/repositories/tickets'
import { activityRepo } from '@/repositories/activity'
import { TicketCreateSchema, TicketUpdateSchema } from '@/schemas'
import { revalidateTag } from 'next/cache'
import { TicketStatus, TicketPriority } from '@prisma/client'

export type TicketFormState = {
  errors?: {
    propertyId?: string[]
    unitId?: string[]
    title?: string[]
    description?: string[]
    priority?: string[]
    cost?: string[]
    _form?: string[]
  }
  success?: boolean
}

export const createTicket = withAuth('maintenance:create', async (
  session,
  prevState: TicketFormState,
  formData: FormData
): Promise<TicketFormState> => {
  try {
    const validatedFields = TicketCreateSchema.safeParse({
      propertyId: formData.get('propertyId'),
      unitId: formData.get('unitId') || null,
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority') || 'medium',
      cost: formData.get('cost') || null,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Create the ticket
    const ticket = await ticketsRepo.create(
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'ticket',
      entityId: ticket.id,
      action: 'create',
      payload: {
        title: ticket.title,
        priority: ticket.priority,
        propertyName: ticket.property.name,
        unitNumber: ticket.unit?.unitNumber,
      },
    })

    // Revalidate cache
    revalidateTag('tickets')
    revalidateTag('properties')
    
    return { success: true }
  } catch (error) {
    console.error('Ticket creation error:', error)
    return {
      errors: {
        _form: [error instanceof Error ? error.message : 'Failed to create ticket. Please try again.'],
      },
    }
  }
})

export const updateTicket = withAuth('maintenance:update', async (
  session,
  ticketId: string,
  prevState: TicketFormState,
  formData: FormData
): Promise<TicketFormState> => {
  try {
    const validatedFields = TicketUpdateSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      cost: formData.get('cost') || null,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Update the ticket
    const ticket = await ticketsRepo.update(
      ticketId,
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'ticket',
      entityId: ticket.id,
      action: 'update',
      payload: {
        title: ticket.title,
      },
    })

    // Revalidate cache
    revalidateTag('tickets')
    
    return { success: true }
  } catch (error) {
    console.error('Ticket update error:', error)
    return {
      errors: {
        _form: ['Failed to update ticket. Please try again.'],
      },
    }
  }
})

export const updateTicketStatus = withAuth('maintenance:update', async (
  session,
  ticketId: string,
  status: TicketStatus
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Get current ticket for logging
    const currentTicket = await ticketsRepo.findById(ticketId, session.organizationId)
    if (!currentTicket) {
      return { error: 'Ticket not found' }
    }

    // Update ticket status
    const ticket = await ticketsRepo.updateStatus(
      ticketId,
      session.organizationId,
      status
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'ticket',
      entityId: ticket.id,
      action: 'update',
      payload: {
        title: ticket.title,
        fromStatus: currentTicket.status,
        toStatus: status,
      },
    })

    // Revalidate cache
    revalidateTag('tickets')
    
    return { success: true }
  } catch (error) {
    console.error('Ticket status update error:', error)
    return { error: 'Failed to update ticket status. Please try again.' }
  }
})

export const assignTicket = withAuth('maintenance:assign', async (
  session,
  ticketId: string,
  assignedToUserId: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Get current ticket for logging
    const currentTicket = await ticketsRepo.findById(ticketId, session.organizationId)
    if (!currentTicket) {
      return { error: 'Ticket not found' }
    }

    // Assign the ticket
    const ticket = await ticketsRepo.assignTicket(
      ticketId,
      session.organizationId,
      assignedToUserId
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'ticket',
      entityId: ticket.id,
      action: 'update',
      payload: {
        title: ticket.title,
        action: 'assign',
        assignedTo: ticket.assignedTo?.user.name || ticket.assignedTo?.user.email,
      },
    })

    // Revalidate cache
    revalidateTag('tickets')
    
    return { success: true }
  } catch (error) {
    console.error('Ticket assignment error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to assign ticket. Please try again.' }
  }
})

export const closeTicket = withAuth('maintenance:update', async (
  session,
  ticketId: string,
  finalCost?: number
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Get current ticket
    const currentTicket = await ticketsRepo.findById(ticketId, session.organizationId)
    if (!currentTicket) {
      return { error: 'Ticket not found' }
    }

    // Update ticket with final cost and close it
    const updateData: any = { status: 'closed' as TicketStatus }
    if (finalCost !== undefined) {
      updateData.cost = finalCost
    }

    const ticket = await ticketsRepo.update(
      ticketId,
      session.organizationId,
      updateData
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'ticket',
      entityId: ticket.id,
      action: 'update',
      payload: {
        title: ticket.title,
        action: 'close',
        finalCost: finalCost,
      },
    })

    // Revalidate cache
    revalidateTag('tickets')
    
    return { success: true }
  } catch (error) {
    console.error('Ticket closure error:', error)
    return { error: 'Failed to close ticket. Please try again.' }
  }
})
