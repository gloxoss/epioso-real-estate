"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SeparatorProps {
  className?: string
  orientation?: "horizontal" | "vertical"
}

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
