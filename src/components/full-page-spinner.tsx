"use client"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { cn } from "@/lib/utils"
import * as React from "react"

export function FullPageSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center w-full h-full min-h-[300px] py-10", className)}>
      <Spinner size={48} className="text-primary" />
    </div>
  )
}
