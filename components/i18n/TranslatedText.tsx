'use client'

import { ReactNode } from 'react'
import { TranslationKey, InterpolationValues } from '@/lib/i18n/config'
import { useI18n, useTranslation, useDirection } from '@/lib/i18n/hooks'
import { cn } from '@/lib/utils'

interface TranslatedTextProps {
  tKey: TranslationKey
  values?: InterpolationValues
  fallback?: string
  className?: string
  as?: keyof JSX.IntrinsicElements
  children?: ReactNode
}

// Main translated text component
export function TranslatedText({
  tKey,
  values,
  fallback,
  className,
  as: Component = 'span',
  children
}: TranslatedTextProps) {
  const { t } = useTranslation()
  const { getTextAlign } = useDirection()
  
  const translatedText = t(tKey, values)
  const displayText = translatedText !== tKey ? translatedText : (fallback || tKey)
  
  return (
    <Component className={cn(getTextAlign(), className)}>
      {displayText}
      {children}
    </Component>
  )
}

// Shorthand component
export function T(props: Omit<TranslatedTextProps, 'as'>) {
  return <TranslatedText {...props} />
}

// Heading components with translation
export function TranslatedHeading({
  level = 1,
  tKey,
  values,
  fallback,
  className,
  children
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6
} & Omit<TranslatedTextProps, 'as'>) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <TranslatedText
      tKey={tKey}
      values={values}
      fallback={fallback}
      className={className}
      as={Component}
    >
      {children}
    </TranslatedText>
  )
}

// Paragraph with translation
export function TranslatedParagraph(props: Omit<TranslatedTextProps, 'as'>) {
  return <TranslatedText {...props} as="p" />
}

// Button text with translation
export function TranslatedButton({
  tKey,
  values,
  fallback,
  onClick,
  disabled,
  variant = 'default',
  size = 'default',
  className,
  children
}: TranslatedTextProps & {
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}) {
  const { t } = useTranslation()
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base button styles
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // Variant styles
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        variant === 'link' && 'text-primary underline-offset-4 hover:underline',
        
        // Size styles
        size === 'default' && 'h-10 px-4 py-2',
        size === 'sm' && 'h-9 rounded-md px-3',
        size === 'lg' && 'h-11 rounded-md px-8',
        size === 'icon' && 'h-10 w-10',
        
        className
      )}
    >
      {t(tKey, values) || fallback || tKey}
      {children}
    </button>
  )
}

// Label with translation
export function TranslatedLabel({
  tKey,
  values,
  fallback,
  htmlFor,
  required,
  className,
  children
}: TranslatedTextProps & {
  htmlFor?: string
  required?: boolean
}) {
  const { t } = useTranslation()
  
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
    >
      {t(tKey, values) || fallback || tKey}
      {required && <span className="text-destructive ml-1">*</span>}
      {children}
    </label>
  )
}

// Error message with translation
export function TranslatedError({
  tKey,
  values,
  fallback,
  className,
  show = true
}: TranslatedTextProps & {
  show?: boolean
}) {
  const { t } = useTranslation()
  
  if (!show) return null
  
  return (
    <p className={cn('text-sm text-destructive', className)}>
      {t(tKey, values) || fallback || tKey}
    </p>
  )
}

// Placeholder with translation
export function TranslatedPlaceholder({
  tKey,
  values,
  fallback
}: Pick<TranslatedTextProps, 'tKey' | 'values' | 'fallback'>) {
  const { t } = useTranslation()
  return t(tKey, values) || fallback || tKey
}

// Tooltip content with translation
export function TranslatedTooltip({
  tKey,
  values,
  fallback,
  children
}: TranslatedTextProps) {
  const { t } = useTranslation()
  
  return (
    <div>
      <div>{children}</div>
      <div className="text-xs text-muted-foreground mt-1">
        {t(tKey, values) || fallback || tKey}
      </div>
    </div>
  )
}

// Status badge with translation
export function TranslatedBadge({
  tKey,
  values,
  fallback,
  variant = 'default',
  className
}: TranslatedTextProps & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}) {
  const { t } = useTranslation()
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-primary text-primary-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground',
        variant === 'outline' && 'border border-input bg-background',
        className
      )}
    >
      {t(tKey, values) || fallback || tKey}
    </span>
  )
}

// Navigation link with translation
export function TranslatedNavLink({
  tKey,
  values,
  fallback,
  href,
  active,
  className,
  children
}: TranslatedTextProps & {
  href: string
  active?: boolean
}) {
  const { t } = useTranslation()
  
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        className
      )}
    >
      {children}
      {t(tKey, values) || fallback || tKey}
    </a>
  )
}

// Form field with translation
export function TranslatedFormField({
  labelKey,
  placeholderKey,
  errorKey,
  labelValues,
  placeholderValues,
  errorValues,
  required,
  error,
  children,
  className
}: {
  labelKey: TranslationKey
  placeholderKey?: TranslationKey
  errorKey?: TranslationKey
  labelValues?: InterpolationValues
  placeholderValues?: InterpolationValues
  errorValues?: InterpolationValues
  required?: boolean
  error?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <TranslatedLabel
        tKey={labelKey}
        values={labelValues}
        required={required}
      />
      {children}
      {error && errorKey && (
        <TranslatedError
          tKey={errorKey}
          values={errorValues}
          show={error}
        />
      )}
    </div>
  )
}

// Conditional translation component
export function ConditionalTranslation({
  condition,
  tKey,
  fallbackKey,
  values,
  className,
  as: Component = 'span'
}: {
  condition: boolean
  tKey: TranslationKey
  fallbackKey?: TranslationKey
  values?: InterpolationValues
  className?: string
  as?: keyof JSX.IntrinsicElements
}) {
  const { t } = useTranslation()
  
  const key = condition ? tKey : (fallbackKey || tKey)
  
  return (
    <Component className={className}>
      {t(key, values)}
    </Component>
  )
}

// Pluralized translation component
export function PluralizedTranslation({
  tKey,
  count,
  values,
  className,
  as: Component = 'span'
}: {
  tKey: TranslationKey
  count: number
  values?: InterpolationValues
  className?: string
  as?: keyof JSX.IntrinsicElements
}) {
  const { t } = useTranslation()
  
  return (
    <Component className={className}>
      {t(tKey, { ...values, count })}
    </Component>
  )
}
