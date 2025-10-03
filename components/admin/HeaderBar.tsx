"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export type HeaderBarProps = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function HeaderBar({ title, subtitle, actions }: HeaderBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
