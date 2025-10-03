"use client"

import React from "react"

export type FilterBarProps = {
  children?: React.ReactNode
  onClear?: () => void
}

export default function FilterBar({ children, onClear }: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {children}
      </div>
      {onClear && (
        <button
          className="text-sm text-muted-foreground hover:underline"
          onClick={onClear}
          type="button"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
