"use client"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { useEffect, useState } from "react"
import { statsCollector } from "@/lib/insightsDataCollector"

const Home = () => {
  const { setIsPageLoaded } = useAppContext()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    statsCollector().then(data => { if (data) setStats(data) })
  }, [])

  useEffect(() => {
    if (!stats) return

    const id = requestAnimationFrame(() => setIsPageLoaded(true))
    return () => cancelAnimationFrame(id)
  }, [stats])

  return (
    <main>
      <section className="mx-6 my-10 max-sm:mt-6 max-sm:mb-10 max-[28rem]:mt-4 max-[28rem]:mx-4">
        <div className="max-w-[1600px] max-sm:flex-col max-sm:gap-6 max-[28rem]:gap-4 mx-auto flex justify-between items-center">
          <div className="titleContainer max-sm:w-full w-1/2">
            <h1 className="text-4xl max-lg:text-3xl max-md:text-2xl max-[28rem]:text-xl font-[1000] mb-4 max-sm:mb-2 font-[Public_sans]">Clean Streets Begin with You</h1>
            <p className="text-lg max-lg:text-base max-md:text-sm font-[Roboto]">TrashTrack is a community-driven platform to report garbage issues, notify authorities, and track cleanliness progress for a cleaner environment.</p>
          </div>
          <div className="max-sm:w-4/5 max-[28rem]:w-full max-[28rem]:mx-4 w-[45%]">
            <div className="relative h-80 max-lg:h-64 max-md:h-52 max-sm:h-64 max-[28rem]:h-48 w-full rounded-s-full overflow-hidden">
              <Image className="" src="/assets/images/image1.jpg" alt="logo" fill style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-black text-white mb-10 max-[52rem]:mb-4 max-[52rem]:p-4 selection:!bg-white/75 selection:!text-[var(--primary-color)]">
        <div className="max-w-[1600px] max-sm:flex-col mx-auto max-sm:mx-0 flex justify-center items-center">
          <div className="tiles -translate-y-12 w-2/5 max-sm:w-full max-sm:flex max-sm:items-center max-sm:flex-col max-lg:w-1/2 scale-110 max-xl:scale-100">
            <div className="firstRow flex gap-[6px] mb-[6px]">
              <div className="tile1 h-48 w-48 max-lg:h-44 max-lg:w-44 max-[52rem]:h-36 max-[52rem]:w-36 max-md:h-32 max-md:w-32 bg-[var(--primary-color)] shadow-[0_0_8px_1px_rgba(0,0,0,0.5)] flex justify-center items-center rounded-s-full rounded-se-full border border-white hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center flex-col">
                  <h2 className="text-4xl max-lg:text-3xl max-[52rem]:text-2xl font-[1000] font-[Public_sans]">{stats?.totalUsersCount}</h2>
                  <div className="text-lg max-lg:text-base max-[52rem]:text-[12px] font-[Roboto]">Registered Users</div>
                </div>
              </div>
              <div className="tile2 h-48 w-48 max-lg:h-44 max-lg:w-44 max-[52rem]:h-36 max-[52rem]:w-36 max-md:h-32 max-md:w-32 bg-[var(--primary-color)] shadow-[0_0_8px_1px_rgba(0,0,0,0.5)] flex justify-center items-center rounded-e-full rounded-ss-full border border-white hover:translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center flex-col">
                  <h2 className="text-4xl max-lg:text-3xl max-[52rem]:text-2xl font-[1000] font-[Public_sans]">{stats?.avgResolutionTime}</h2>
                  <div className="text-lg max-lg:text-base max-[52rem]:text-[12px] font-[Roboto]">Avg. Resolution Time</div>
                </div>
              </div>
            </div>
            <div className="secondRow flex gap-[6px]">
              <div className="tile3 h-48 w-48 max-lg:h-44 max-lg:w-44 max-[52rem]:h-36 max-[52rem]:w-36 max-md:h-32 max-md:w-32 bg-[var(--primary-color)] shadow-[0_0_8px_1px_rgba(0,0,0,0.5)] flex justify-center items-center rounded-s-full rounded-ee-full border border-white hover:-translate-x-0.5 hover:translate-y-0.5 transition-all">
                <div className="flex items-center flex-col">
                  <h2 className="text-4xl max-lg:text-3xl max-[52rem]:text-2xl font-[1000] font-[Public_sans]">{stats?.totalReports}</h2>
                  <div className="text-lg max-lg:text-base max-[52rem]:text-[12px] font-[Roboto]">Total Reports</div>
                </div>
              </div>
              <div className="tile4 h-48 w-48 max-lg:h-44 max-lg:w-44 max-[52rem]:h-36 max-[52rem]:w-36 max-md:h-32 max-md:w-32 bg-[var(--primary-color)] shadow-[0_0_8px_1px_rgba(0,0,0,0.5)] flex justify-center items-center rounded-e-full rounded-es-full border border-white hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                <div className="flex items-center flex-col">
                  <h2 className="text-4xl max-lg:text-3xl max-[52rem]:text-2xl font-[1000] font-[Public_sans]">{stats?.resolvedReports}</h2>
                  <div className="text-lg max-lg:text-base max-[52rem]:text-[12px] font-[Roboto]">Resolved Reports</div>
                </div>
              </div>
            </div>
          </div>
          <div className="title2Container w-2/5 max-sm:w-full selection:!bg-white/75 selection:!text-black">
            <h1 className="text-4xl max-lg:text-3xl max-md:text-2xl max-[28rem]:text-xl font-[1000] mb-4 max-sm:mb-2 font-[Public_sans]">Join the Effort to Keep Our City Clean</h1>
            <p className="text-lg max-lg:text-base max-md:text-sm font-[Roboto]">Our platform is designed to empower responsible citizens and unite local communities in taking actionable steps towards a cleaner, eco-friendly environment.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home