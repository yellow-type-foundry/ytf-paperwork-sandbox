"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

// Sample font list for the type foundry
const fonts = [
  { value: "ytf-sans", label: "YTF Sans" },
  { value: "ytf-serif", label: "YTF Serif" },
  { value: "ytf-mono", label: "YTF Mono" },
  { value: "ytf-display", label: "YTF Display" },
  { value: "ytf-headline", label: "YTF Headline" },
  { value: "ytf-text", label: "YTF Text" },
  { value: "ytf-script", label: "YTF Script" },
  { value: "ytf-condensed", label: "YTF Condensed" },
  { value: "ytf-extended", label: "YTF Extended" },
  { value: "ytf-rounded", label: "YTF Rounded" },
]

export function FontSelector({ onSelectionChange }) {
  const [open, setOpen] = React.useState(false)
  const [selectedFonts, setSelectedFonts] = React.useState([])

  const handleSelect = (font) => {
    let newSelection

    if (selectedFonts.some((item) => item.value === font.value)) {
      // Remove the font if already selected
      newSelection = selectedFonts.filter((item) => item.value !== font.value)
    } else {
      // Add the font if not already selected
      newSelection = [...selectedFonts, font]
    }

    setSelectedFonts(newSelection)
    onSelectionChange(newSelection)
  }

  const removeFont = (font, e) => {
    e.preventDefault()
    const newSelection = selectedFonts.filter((item) => item.value !== font.value)
    setSelectedFonts(newSelection)
    onSelectionChange(newSelection)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            Select fonts...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search fonts..." />
            <CommandList>
              <CommandEmpty>No font found.</CommandEmpty>
              <CommandGroup>
                {fonts.map((font) => (
                  <CommandItem key={font.value} value={font.value} onSelect={() => handleSelect(font)}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedFonts.some((item) => item.value === font.value) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {font.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedFonts.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedFonts.map((font) => (
            <Badge key={font.value} variant="secondary" className="px-3 py-1">
              {font.label}
              <button className="ml-2 text-muted-foreground hover:text-foreground" onClick={(e) => removeFont(font, e)}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
