'use server'

import { withAuth } from '@/lib/rbac'
import { propertiesRepo } from '@/repositories/properties'
import { activityRepo } from '@/repositories/activity'
import { PropertyCreateSchema, PropertyUpdateSchema } from '@/schemas'
import { redirect, isRedirectError } from 'next/navigation'
import { revalidateTag } from 'next/cache'

export type PropertyFormState = {
  errors?: {
    name?: string[]
    address?: string[]
    description?: string[]
    propertyType?: string[]
    expectedUnits?: string[]
    imageUrl?: string[]
    _form?: string[]
  }
  success?: boolean
}

export const createProperty = withAuth('properties:create', async (
  session,
  prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> => {
  try {
    const validatedFields = PropertyCreateSchema.safeParse({
      name: formData.get('name'),
      address: formData.get('address') || null,
      description: formData.get('description') || null,
      propertyType: formData.get('propertyType') || null,
      expectedUnits: formData.get('expectedUnits') || null,
      imageUrl: formData.get('imageUrl') || null,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Create the property
    const property = await propertiesRepo.create(
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'property',
      entityId: property.id,
      action: 'create',
      payload: { name: property.name },
    })

    // Revalidate cache
    revalidateTag('properties')
    
    // Redirect to the new property page
    redirect(`/properties/${property.id}`)
  } catch (error) {
    // Don't catch redirect errors - they're expected
    if (isRedirectError(error)) {
      throw error
    }

    console.error('Property creation error:', error)
    return {
      errors: {
        _form: ['Failed to create property. Please try again.'],
      },
    }
  }
})

export const updateProperty = withAuth('properties:update', async (
  session,
  propertyId: string,
  prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> => {
  try {
    const validatedFields = PropertyUpdateSchema.safeParse({
      name: formData.get('name'),
      address: formData.get('address') || null,
      description: formData.get('description') || null,
      propertyType: formData.get('propertyType') || null,
      expectedUnits: formData.get('expectedUnits') || null,
      imageUrl: formData.get('imageUrl') || null,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Update the property
    const property = await propertiesRepo.update(
      propertyId,
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'property',
      entityId: property.id,
      action: 'update',
      payload: { name: property.name },
    })

    // Revalidate cache
    revalidateTag('properties')
    
    return { success: true }
  } catch (error) {
    console.error('Property update error:', error)
    return {
      errors: {
        _form: ['Failed to update property. Please try again.'],
      },
    }
  }
})

export const deleteProperty = withAuth('properties:delete', async (
  session,
  propertyId: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Get property name for logging
    const property = await propertiesRepo.findById(propertyId, session.organizationId)
    if (!property) {
      return { error: 'Property not found' }
    }

    // Soft delete the property
    await propertiesRepo.softDelete(propertyId, session.organizationId)

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'property',
      entityId: propertyId,
      action: 'delete',
      payload: { name: property.name },
    })

    // Revalidate cache
    revalidateTag('properties')
    
    return { success: true }
  } catch (error) {
    console.error('Property deletion error:', error)
    return { error: 'Failed to delete property. Please try again.' }
  }
})
