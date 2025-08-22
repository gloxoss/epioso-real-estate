'use server'

import { withAuth } from '@/lib/rbac'
import { unitsRepo } from '@/repositories/units'
import { activityRepo } from '@/repositories/activity'
import { UnitCreateSchema, UnitUpdateSchema, UnitStatusMoveSchema } from '@/schemas'
import { revalidateTag } from 'next/cache'
import { UnitStatus } from '@prisma/client'

export type UnitFormState = {
  errors?: {
    propertyId?: string[]
    unitNumber?: string[]
    rentAmount?: string[]
    status?: string[]
    _form?: string[]
  }
  success?: boolean
}

export const createUnit = withAuth('units:create', async (
  session,
  prevState: UnitFormState,
  formData: FormData
): Promise<UnitFormState> => {
  try {
    const validatedFields = UnitCreateSchema.safeParse({
      propertyId: formData.get('propertyId'),
      unitNumber: formData.get('unitNumber'),
      rentAmount: formData.get('rentAmount') || null,
      status: formData.get('status') || 'available',
      attributes: {},
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Create the unit
    const unit = await unitsRepo.create(
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'unit',
      entityId: unit.id,
      action: 'create',
      payload: { 
        unitNumber: unit.unitNumber,
        status: unit.status,
      },
    })

    // Revalidate cache
    revalidateTag('units')
    revalidateTag('properties')
    
    return { success: true }
  } catch (error) {
    console.error('Unit creation error:', error)
    return {
      errors: {
        _form: [error instanceof Error ? error.message : 'Failed to create unit. Please try again.'],
      },
    }
  }
})

export const updateUnit = withAuth('units:update', async (
  session,
  unitId: string,
  prevState: UnitFormState,
  formData: FormData
): Promise<UnitFormState> => {
  try {
    const validatedFields = UnitUpdateSchema.safeParse({
      unitNumber: formData.get('unitNumber'),
      rentAmount: formData.get('rentAmount') || null,
      status: formData.get('status'),
      attributes: {},
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Update the unit
    const unit = await unitsRepo.update(
      unitId,
      session.organizationId,
      validatedFields.data
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'unit',
      entityId: unit.id,
      action: 'update',
      payload: { 
        unitNumber: unit.unitNumber,
      },
    })

    // Revalidate cache
    revalidateTag('units')
    revalidateTag('properties')
    
    return { success: true }
  } catch (error) {
    console.error('Unit update error:', error)
    return {
      errors: {
        _form: ['Failed to update unit. Please try again.'],
      },
    }
  }
})

export const moveUnitStatus = withAuth('units:move_status', async (
  session,
  unitId: string,
  toStatus: UnitStatus,
  notes?: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Validate the status move
    const validatedFields = UnitStatusMoveSchema.safeParse({
      unitId,
      toStatus,
      notes,
    })

    if (!validatedFields.success) {
      return { error: 'Invalid status move data' }
    }

    // Get current unit for logging
    const currentUnit = await unitsRepo.findById(unitId, session.organizationId)
    if (!currentUnit) {
      return { error: 'Unit not found' }
    }

    // Move the unit status
    const unit = await unitsRepo.moveStatus(
      unitId,
      session.organizationId,
      toStatus,
      notes
    )

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'unit',
      entityId: unit.id,
      action: 'move_status',
      payload: { 
        unitNumber: currentUnit.unitNumber,
        fromStatus: currentUnit.status,
        toStatus,
        notes,
      },
    })

    // Revalidate cache
    revalidateTag('units')
    revalidateTag('properties')
    
    return { success: true }
  } catch (error) {
    console.error('Unit status move error:', error)
    return { error: 'Failed to move unit status. Please try again.' }
  }
})

export const deleteUnit = withAuth('units:delete', async (
  session,
  unitId: string
): Promise<{ success?: boolean; error?: string }> => {
  try {
    // Get unit for logging
    const unit = await unitsRepo.findById(unitId, session.organizationId)
    if (!unit) {
      return { error: 'Unit not found' }
    }

    // Soft delete the unit
    await unitsRepo.softDelete(unitId, session.organizationId)

    // Log activity
    await activityRepo.log(session.organizationId, {
      entityType: 'unit',
      entityId: unitId,
      action: 'delete',
      payload: { 
        unitNumber: unit.unitNumber,
        propertyName: unit.property.name,
      },
    })

    // Revalidate cache
    revalidateTag('units')
    revalidateTag('properties')
    
    return { success: true }
  } catch (error) {
    console.error('Unit deletion error:', error)
    return { error: 'Failed to delete unit. Please try again.' }
  }
})

// Optimistic update for Kanban board
export const moveUnitStatusOptimistic = withAuth('units:move_status', async (
  session,
  unitId: string,
  toStatus: UnitStatus,
  notes?: string
): Promise<{ success?: boolean; error?: string; unit?: any }> => {
  try {
    // Get current unit
    const currentUnit = await unitsRepo.findById(unitId, session.organizationId)
    if (!currentUnit) {
      return { error: 'Unit not found' }
    }

    // Move the unit status
    const unit = await unitsRepo.moveStatus(
      unitId,
      session.organizationId,
      toStatus,
      notes
    )

    // Log activity (async, don't wait)
    activityRepo.log(session.organizationId, {
      entityType: 'unit',
      entityId: unit.id,
      action: 'move_status',
      payload: { 
        unitNumber: currentUnit.unitNumber,
        fromStatus: currentUnit.status,
        toStatus,
        notes,
      },
    }).catch(console.error)

    // Revalidate cache (async, don't wait)
    Promise.all([
      revalidateTag('units'),
      revalidateTag('properties'),
    ]).catch(console.error)
    
    return { success: true, unit }
  } catch (error) {
    console.error('Optimistic unit status move error:', error)
    return { error: 'Failed to move unit status. Please try again.' }
  }
})
