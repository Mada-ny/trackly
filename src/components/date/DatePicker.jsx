import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function DatePicker({ 
    id, 
    value, 
    onChange,
    minDate,
    maxDate,
}) {
    const [open, setOpen] = useState(false);

    const disabled = (date) => {
        if (!minDate && !maxDate) {
            return date > new Date()
        }
        if (minDate && date < minDate) return true
        if (maxDate && date > maxDate) return true
        return false
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant="outline"
                    className="w-full justify-between font-normal"
                >
                    {value ? value.toLocaleDateString() : "Sélectionner une date"}
                    <ChevronDown />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                        onChange(date)
                        setOpen(false)
                    }}
                    disabled={disabled}
                />
            </PopoverContent>
        </Popover>
    )
}