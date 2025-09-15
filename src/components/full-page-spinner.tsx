"use client"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { cn } from "@/lib/utils"
// React import removed (no JSX transform need if using automatic runtime configured, otherwise not required explicitly)

export function FullPageSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center w-full h-full min-h-[300px] py-10", className)}>
      <Spinner size={48} className="text-primary" />
    </div>
  )
}
