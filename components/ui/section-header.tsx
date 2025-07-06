import React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SectionTitle } from "./section-title"

interface SectionHeaderProps {
  title: string
  showAddButton?: boolean
  onAddClick?: () => void
  className?: string
}

export function SectionHeader({ title, showAddButton, onAddClick, className }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <SectionTitle className={className}>{title}</SectionTitle>
      {showAddButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddClick}
          className="p-0 h-auto hover:bg-transparent"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 