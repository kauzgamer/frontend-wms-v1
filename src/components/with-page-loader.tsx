"use client"
import { useEffect, useState } from "react"
import { FullPageSpinner } from "@/components/full-page-spinner"

interface WithPageLoaderOptions {
  minDelay?: number // minimum spinner display time (ms)
}

export function withPageLoader<P extends object>(
  Component: React.ComponentType<P>,
  options: WithPageLoaderOptions = {}
) {
  const { minDelay = 400 } = options
  const Wrapped = (props: P) => {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
      const timeout = setTimeout(() => setLoading(false), minDelay)
      return () => clearTimeout(timeout)
    }, [])
    if (loading) return <FullPageSpinner />
    return <Component {...props} />
  }
  Wrapped.displayName = `WithPageLoader(${Component.displayName || Component.name || 'Component'})`
  return Wrapped
}
