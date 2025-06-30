'use client'
import { useEffect } from "react"
import { usePathname } from "next/navigation"

const RouteTracker = () => {
  const pathname = usePathname()

  useEffect(() => {
    const prev = sessionStorage.getItem("current-page")
    if (prev) sessionStorage.setItem("prev-page", prev)
    sessionStorage.setItem("current-page", pathname)
  }, [pathname])

  return null
}

export default RouteTracker