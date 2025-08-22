import { useState, useCallback } from 'react'
import { z } from 'zod'

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
  initialData?: Partial<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

interface FormState<T> {
  data: Partial<T>
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  touchedFields: Set<keyof T>
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  onSubmit,
  initialData = {},
  validateOnChange = false,
  validateOnBlur = true
}: UseFormValidationOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false,
    touchedFields: new Set()
  })

  // Validate a single field
  const validateField = useCallback((field: keyof T, value: any) => {
    try {
      const fieldSchema = schema.shape[field as string]
      if (fieldSchema) {
        fieldSchema.parse(value)
        return null
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Invalid value'
      }
    }
    return null
  }, [schema])

  // Validate all fields
  const validateAll = useCallback(() => {
    try {
      schema.parse(state.data)
      return {}
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof T, string>> = {}
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0] as keyof T
            errors[field] = err.message
          }
        })
        return errors
      }
    }
    return {}
  }, [schema, state.data])

  // Update field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newData = { ...prev.data, [field]: value }
      const newTouchedFields = new Set(prev.touchedFields).add(field)
      
      let newErrors = { ...prev.errors }
      
      // Validate on change if enabled
      if (validateOnChange || prev.touchedFields.has(field)) {
        const fieldError = validateField(field, value)
        if (fieldError) {
          newErrors[field] = fieldError
        } else {
          delete newErrors[field]
        }
      }

      const isValid = Object.keys(newErrors).length === 0
      const isDirty = JSON.stringify(newData) !== JSON.stringify(initialData)

      return {
        ...prev,
        data: newData,
        errors: newErrors,
        touchedFields: newTouchedFields,
        isValid,
        isDirty
      }
    })
  }, [validateField, validateOnChange, initialData])

  // Handle field blur
  const onBlur = useCallback((field: keyof T) => {
    if (validateOnBlur) {
      setState(prev => {
        const fieldError = validateField(field, prev.data[field])
        const newErrors = { ...prev.errors }
        
        if (fieldError) {
          newErrors[field] = fieldError
        } else {
          delete newErrors[field]
        }

        return {
          ...prev,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0
        }
      })
    }
  }, [validateField, validateOnBlur])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      // Validate all fields
      const validationErrors = validateAll()
      
      if (Object.keys(validationErrors).length > 0) {
        setState(prev => ({
          ...prev,
          errors: validationErrors,
          isSubmitting: false,
          isValid: false
        }))
        return
      }

      // Parse and submit data
      const validData = schema.parse(state.data)
      await onSubmit(validData)

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isValid: true
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubmitting: false
      }))
      throw error
    }
  }, [schema, state.data, onSubmit, validateAll])

  // Reset form
  const reset = useCallback((newData?: Partial<T>) => {
    setState({
      data: newData || initialData,
      errors: {},
      isSubmitting: false,
      isValid: false,
      isDirty: false,
      touchedFields: new Set()
    })
  }, [initialData])

  // Set multiple values at once
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newData = { ...prev.data, ...values }
      const isDirty = JSON.stringify(newData) !== JSON.stringify(initialData)

      return {
        ...prev,
        data: newData,
        isDirty
      }
    })
  }, [initialData])

  // Get field props for easy integration with form inputs
  const getFieldProps = useCallback((field: keyof T) => ({
    value: state.data[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(field, e.target.value)
    },
    onBlur: () => onBlur(field),
    error: state.errors[field],
    'aria-invalid': !!state.errors[field]
  }), [state.data, state.errors, setValue, onBlur])

  return {
    // State
    data: state.data,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    isDirty: state.isDirty,
    touchedFields: state.touchedFields,

    // Actions
    setValue,
    setValues,
    onBlur,
    handleSubmit,
    reset,
    getFieldProps,

    // Utilities
    validateField,
    validateAll
  }
}
