"use client"
import { useAppContext } from "@/context/AppContext"
import CitizenDashboard from "@/components/CitizenDashboard"
import OfficerDashboard from "@/components/OfficerDashboard"
import { useEffect } from "react"
import { toast } from "react-toastify"

const Dashboard = () => {
  const { user } = useAppContext()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("error") === "alreadyLoggedIn") {
      toast.error("Already Logged in!")
      searchParams.delete("error")
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`
      window.history.replaceState({}, "", newUrl)
    }
  }, [])

  if (user?.role === "citizen") return <CitizenDashboard />
  if (user?.role === "officer") return <OfficerDashboard />
}

export default Dashboard