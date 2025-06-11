"use client"
import { useAppContext } from "@/context/AppContext"
import CitizenDashboard from "@/components/CitizenDashboard"
import OfficerDashboard from "@/components/OfficerDashboard"

const Dashboard = () => {
  const { user } = useAppContext()

  if (user?.role === "citizen") return <CitizenDashboard />
  if (user?.role === "officer") return <OfficerDashboard />
}

export default Dashboard