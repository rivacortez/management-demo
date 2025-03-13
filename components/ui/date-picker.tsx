"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DatePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    disabled?: boolean
    placeholder?: string
    side?: "top" | "right" | "bottom" | "left"
    align?: "start" | "center" | "end"
    className?: string
}

export default function DatePicker({
                                       date,
                                       setDate,
                                       disabled = false,
                                       placeholder = "Seleccionar fecha",
                                       side = "bottom",
                                       align = "start",
                                       className
                                   }: DatePickerProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className={cn("relative", className)}>
            <Popover open={disabled ? false : open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={disabled}
                        type="button"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: es }) : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0"
                    align={align}
                    side={side}
                    sideOffset={4}
                >
                    <Calendar
  mode="single"
  selected={date}
  onSelect={(selected) => {
    if (!selected) {
      setDate(undefined);
    } else if (selected instanceof Date) {
      setDate(selected);
    } else if (Array.isArray(selected)) {
      // En modo "single" normalmente no se espera un array, pero lo manejamos para seguridad.
      setDate(selected[0] || undefined);
    } else if (typeof selected === "object" && "from" in selected) {
      // Si es un objeto con from/to, usamos 'from'
      setDate(selected.from);
    } else {
      setDate(undefined);
    }
  }}
  initialFocus
  showOutsideDays
/>
                </PopoverContent>
            </Popover>
        </div>
    )
}