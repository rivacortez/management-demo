"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, startOfWeek, endOfWeek, Locale } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CalendarProps {
    mode?: "single" | "range" | "multiple"
    selected?: Date | Date[] | { from?: Date; to?: Date } | undefined
    onSelect?: (date: Date | Date[] | { from?: Date; to?: Date } | undefined) => void
    disabled?: (date: Date) => boolean
    className?: string
    showOutsideDays?: boolean
    locale?: Locale
    initialFocus?: boolean
    month?: Date
    defaultMonth?: Date
    numberOfMonths?: number
    fromDate?: Date
    toDate?: Date
    captionLayout?: "dropdown" | "buttons"
}

function Calendar({
                      className,
                      showOutsideDays = true,
                      mode = "single",
                      selected,
                      onSelect,
                      disabled,
                      locale = es,
                      ...props
                  }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState<Date>(
        props.month || props.defaultMonth || new Date()
    )

    // Week days header
    const weekDays = React.useMemo(() => {
        const start = startOfWeek(new Date(), { locale })
        return Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(start, i)
            return format(day, "EEEEEE", { locale })
        })
    }, [locale])

    // Generate days for the calendar
    const days = React.useMemo(() => {
        const firstDayOfMonth = startOfMonth(currentMonth)
        const lastDayOfMonth = endOfMonth(currentMonth)
        const startDate = startOfWeek(firstDayOfMonth, { locale })
        const endDate = endOfWeek(lastDayOfMonth, { locale })

        return eachDayOfInterval({ start: startDate, end: endDate })
    }, [currentMonth, locale])

    // Handle day selection based on mode
    const handleDaySelect = (day: Date) => {
        if (disabled?.(day)) return

        if (mode === "single") {
            onSelect?.(day)
        } else if (mode === "multiple") {
            if (!Array.isArray(selected)) {
                onSelect?.([day])
            } else {
                const isSelected = selected.some(selectedDay => isSameDay(selectedDay, day))
                if (isSelected) {
                    onSelect?.(selected.filter(selectedDay => !isSameDay(selectedDay, day)))
                } else {
                    onSelect?.([...selected, day])
                }
            }
        } else if (mode === "range") {
            const range = selected as { from?: Date; to?: Date } || { from: undefined, to: undefined }
            if (!range.from) {
                onSelect?.({ from: day, to: undefined })
            } else if (!range.to && !isSameDay(range.from, day)) {
                const isAfter = day > range.from
                if (isAfter) {
                    onSelect?.({ from: range.from, to: day })
                } else {
                    onSelect?.({ from: day, to: range.from })
                }
            } else {
                onSelect?.({ from: day, to: undefined })
            }
        }
    }

    // Check if a day is selected
    const isSelected = (day: Date): boolean => {
        if (!selected) return false

        if (mode === "single") {
            return isSameDay(selected as Date, day)
        } else if (mode === "multiple") {
            return (selected as Date[]).some(selectedDay => isSameDay(selectedDay, day))
        } else if (mode === "range") {
            const range = selected as { from?: Date; to?: Date }

            if (range.from && range.to) {
                return isSameDay(range.from, day) ||
                    isSameDay(range.to, day) ||
                    (day > range.from && day < range.to)
            }

            return range.from ? isSameDay(range.from, day) : false
        }

        return false
    }

    // Handle month navigation
    const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
    const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))

    return (
        <div className={cn("p-3", className)}>
            <div className="flex justify-center pt-1 relative items-center">
                <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
                    )}
                    aria-label="Mes anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-medium">
                    {format(currentMonth, "MMMM yyyy", { locale })}
                </div>
                <button
                    type="button"
                    onClick={goToNextMonth}
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
                    )}
                    aria-label="Mes siguiente"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-1 mt-3">
                <div className="grid grid-cols-7 gap-0">
                    {weekDays.map(day => (
                        <div
                            key={day}
                            className="text-muted-foreground font-normal text-[0.8rem] text-center"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, dayIndex) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth)
                        const isToday = isSameDay(day, new Date())
                        const isDisabled = disabled ? disabled(day) : false
                        const daySelected = isSelected(day)

                        return (
                            <div
                                key={dayIndex}
                                className={cn(
                                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                                    daySelected && "bg-accent rounded-md"
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleDaySelect(day)}
                                    disabled={isDisabled}
                                    className={cn(
                                        buttonVariants({ variant: "ghost" }),
                                        "h-8 w-8 p-0 font-normal",
                                        daySelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                        isToday && !daySelected && "bg-accent text-accent-foreground",
                                        (!isCurrentMonth && !showOutsideDays) && "invisible",
                                        !isCurrentMonth && "text-muted-foreground opacity-50",
                                        isDisabled && "text-muted-foreground opacity-50"
                                    )}
                                    aria-label={format(day, "PPP", { locale })}
                                    aria-pressed={daySelected}
                                >
                                    {format(day, "d")}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

Calendar.displayName = "Calendar"

export { Calendar }