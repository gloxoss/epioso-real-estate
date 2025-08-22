'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range'
  selected?: Date | Date[] | { from: Date; to?: Date }
  onSelect?: (date: Date | Date[] | { from: Date; to?: Date } | undefined) => void
  initialFocus?: boolean
  className?: string
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  initialFocus,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (mode === 'single' && onSelect) {
      onSelect(clickedDate)
    }
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    
    if (mode === 'single' && selected instanceof Date) {
      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      return dayDate.toDateString() === selected.toDateString()
    }
    
    return false
  }

  const isToday = (day: number) => {
    const today = new Date()
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return dayDate.toDateString() === today.toDateString()
  }

  return (
    <div className={cn('p-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={previousMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2" />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          return (
            <Button
              key={day}
              variant={isSelected(day) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleDateClick(day)}
              className={cn(
                'h-9 w-9 p-0 font-normal',
                isToday(day) && !isSelected(day) && 'bg-accent text-accent-foreground',
                isSelected(day) && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
              )}
            >
              {day}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
