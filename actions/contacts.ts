'use server'

import { withAuth } from '@/lib/rbac'
import { contactsRepo } from '@/repositories/contacts'
import { activityRepo } from '@/repositories/activity'
import { ContactCreateSchema, ContactUpdateSchema } from '@/schemas'
import { revalidateTag } from 'next/cache'

export type ContactFormState = {
  errors?: {
    type?: string[]
    name?: string[]
    email?: string[]
    phone?: string[]
    address?: string[]
    notes?: string[]
    _form?: string[]
  }
  success?: boolean
}

export const createContact = withAuth('contacts:create', async (
  session,
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> => {
  try {
    const validatedFields = ContactCreateSchema.safeParse({
      type: formData.get('type'),
      name: formData.get('name'),
      email: formData.get('email') || null,
      phone: formData.get('phone'),
      address: formData.get('address') || null,
      notes: formData.get('notes') || null,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Create the contact
    const contact = await contactsRepo.create(
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'contact',
      entityId: contact.id,
      action: 'create',
      payload: {
        name: contact.name,
        type: contact.type,
        email: contact.email,
      },
    })

    // Revalidate cache
    revalidateTag('contacts')
    
    return { success: true }
  } catch (error) {
    console.error('Contact creation error:', error)
    return {
      errors: {
        _form: [error instanceof Error ? error.message : 'Failed to create contact. Please try again.'],
      },
    }
  }
})

export const updateContact = withAuth('contacts:update', async (
  session,
  contactId: string,
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> => {
  try {
    const validatedFields = ContactUpdateSchema.safeParse({
      type: formData.get('type'),
      name: formData.get('name'),
      email: formData.get('email') || null,
      phone: formData.get('phone'),
      address: formData.get('address') || null,
      notes: formData.get('notes') || null,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Update the contact
    const contact = await contactsRepo.update(
      contactId,
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'contact',
      entityId: contact.id,
      action: 'update',
      payload: {
        name: contact.name,
        type: contact.type,
      },
    })

    // Revalidate cache
    revalidateTag('contacts')
    
    return { success: true }
  } catch (error) {
    console.error('Contact update error:', error)
    return {
      errors: {
        _form: [error instanceof Error ? error.message : 'Failed to update contact. Please try again.'],
      },
    }
  }
})

export const deleteContact = withAuth('contacts:delete', async (
  session,
  contactId: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Get contact for logging
    const contact = await contactsRepo.findById(contactId, session.organizationId)
    if (!contact) {
      return { error: 'Contact not found' }
    }

    // Check if contact has related records
    if (contact.invoices.length > 0 || contact.expenses.length > 0) {
      return { 
        error: 'Cannot delete contact with existing invoices or expenses. Please remove related records first.' 
      }
    }

    // Soft delete the contact
    await contactsRepo.softDelete(contactId, session.organizationId)

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'contact',
      entityId: contactId,
      action: 'delete',
      payload: {
        name: contact.name,
        type: contact.type,
      },
    })

    // Revalidate cache
    revalidateTag('contacts')
    
    return { success: true }
  } catch (error) {
    console.error('Contact deletion error:', error)
    return { error: 'Failed to delete contact. Please try again.' }
  }
})
