"use client"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { useEffect, useState } from "react"
import { statsCollector } from "@/lib/insightsDataCollector"

const Home = () => {
  const { setIsPageLoaded } = useAppContext()
  const [stats, setStats] = useState(null)
  useEffect(() => {
    statsCollector().then(data => { if (data) setStats(data); console.log(data) })
  }, [])

  useEffect(() => {
    const handleLoad = () => requestAnimationFrame(() => setIsPageLoaded(true))

    if (document.readyState === "complete") handleLoad()
    else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  return (
    <main className="pt-10">
      <section className=" mb-10">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="titleContainer w-1/2">
            <h1 className="text-5xl font-[1000] mb-4 font-[Public_sans]">Clean Streets Begin with You</h1>
            <p className="text-xl font-[Roboto]">TrashTrack is a community-driven platform to report garbage issues, notify authorities, and track cleanliness progress for a cleaner environment.</p>
          </div>
          <div className="w-2/5">
            <Image className="rounded-s-full" src="/assets/images/image1.jpg" alt="logo" height="768" width="768" />
          </div>
        </div>
      </section>
      <section className="bg-black text-white mb-10 selection:!bg-white/75 selection:!text-[var(--primary-color)]">
        <div className="max-w-[1600px] mx-auto flex justify-center-safe items-center">
          <div className="tiles -translate-y-12 w-2/5 scale-110">
            <div className="firstRow flex gap-[6px] mb-[6px]">
              <div className="tile1 h-48 w-48 bg-[var(--primary-color)] shadow-[0_0_8px_1px_rgba(0,0,0,0.5)] flex justify-center items-center rounded-s-full rounded-se-full border border-white hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center flex-col">
                  <h2 className="text-4xl font-[1000] font-[Public_sans]">{stats?.totalUsersCount}</h2>
                  <div className="text-lg font-[Roboto]">Registered Users</div>
                </div>
              </div>
              <div className="tile2 h-48 w-48 bg-[var(--primary-color)] shadow-[0_0_8px_1px_rgba(0,0,0,0.5)] flex justify-center items-center rounded-e-full rounded-ss-full border border-white hover:translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center flex-col">
                  <h2 className="text-4xl font-[1000] font-[Public_sans]">{stats?.avgResolutionTime}</h2>
                  <div className="text-lg font-[Roboto]">Avg. Resolution Time</div>
                </div>
              </div>
            </div>
            <div className="secondRow flex gap-[6px]">
              <div className="tile3 h-48 w-48 bg-[var(--primary-color)] shadow-[0_0_8px_1px_rgba(0,0,0,0.5)] flex justify-center items-center rounded-s-full rounded-ee-full border border-white hover:-translate-x-0.5 hover:translate-y-0.5 transition-all">
                <div className="flex items-center flex-col">
                  <h2 className="text-4xl font-[1000] font-[Public_sans]">{stats?.totalReports}</h2>
                  <div className="text-lg font-[Roboto]">Total Reports</div>
                </div>
              </div>
              <div className="tile4 h-48 w-48 bg-[var(--primary-color)] shadow-[0_0_8px_1px_rgba(0,0,0,0.5)] flex justify-center items-center rounded-e-full rounded-es-full border border-white hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <div className="flex items-center flex-col">
                  <h2 className="text-4xl font-[1000] font-[Public_sans]">{stats?.resolvedReports}</h2>
                  <div className="text-lg font-[Roboto]">Resolved Reports</div>
                </div>
              </div>
            </div>
          </div>
          <div className="title2Container w-2/5 selection:!bg-white/75 selection:!text-black">
            <h1 className="text-5xl font-[1000] mb-4 font-[Public_sans]">Join the Effort to Keep Our City Clean</h1>
            <p className="text-xl font-[Roboto]">Our platform is designed to empower responsible citizens and unite local communities in taking actionable steps towards a cleaner, eco-friendly environment.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home