"use client"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { useEffect } from "react"

const About = () => {
  const { setIsPageLoaded } = useAppContext()
  useEffect(() => {
    const handleLoad = () => requestAnimationFrame(() => setIsPageLoaded(true))

    if (document.readyState === "complete") handleLoad()
    else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  return (
    <main>
      <section className="h-[50vh] w-full bg-[url('/assets/images/image11.jpg')] relative bg-cover bg-center flex justify-center items-center">
        <div className="aboutHeadingContainer bg-[var(--primary-color)] w-fit px-8 py-12 rounded-[100px/30px] z-10">
          <h1 className="text-4xl font-[1000] text-white selection:!bg-white/75 selection:!text-[var(--primary-color)]">ABOUT TRASHTRACK</h1>
        </div>
        <div className="darkOverlay absolute top-0 h-full w-full bg-[var(--primary-color)] opacity-25"></div>
      </section>
      <section className="bg-black text-white py-8">
        <div className="max-w-[1340px] mx-auto flex justify-between items-center">
          <div className="title2Container w-2/5 selection:!bg-white/75 selection:!text-black">
            <h1 className="text-4xl font-[1000] mb-4 font-[Public_sans]">JOIN THE EFFORT TO KEEP OUR CITY CLEAN</h1>
            <p className="text-xl font-[Roboto]">Our platform is designed to empower responsible citizens and unite local communities in taking actionable steps towards a cleaner, eco-friendly environment.</p>
          </div>
          <div className="imgContainer relative w-fit z-10">
            <div className="flex items-center gap-2">
              <div>
                <Image className="rounded-lg" src="/assets/images/image3.jpg" alt="logo" height="280" width="280" />
              </div>
              <div className="flex items-center flex-col gap-2">
                <div>
                  <Image className="rounded-lg" src="/assets/images/image3.jpg" alt="logo" height="344" width="344" />
                </div>
                <div>
                  <Image className="rounded-lg" src="/assets/images/image3.jpg" alt="logo" height="324" width="324" />
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-1/2 -z-10 rounded-full h-32 w-32 bg-[var(--primary-color)]"></div>
          </div>
        </div>
      </section>
      <section className="py-8">
        <div className="max-w-[1340px] mx-auto flex justify-between items-center">
          <div className="imgContainer2 relative w-fit z-10">
            <div className="flex flex-col gap-4">
              <div>
                <Image className="rounded-ss-[8rem] rounded-se-xl rounded-ee-[8rem]" src="/assets/images/image7.jpg" alt="logo" height="352" width="352" />
              </div>
              <div>
                <Image className="rounded-es-[8rem] rounded-ee-xl rounded-se-[8rem]" src="/assets/images/image7.jpg" alt="logo" height="384" width="384" />
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4 -z-10 rounded-full h-32 w-32 bg-[var(--primary-color)]"></div>
          </div>
          <div className="title3Container w-2/5">
            <h1 className="text-4xl font-[1000] mb-4 font-[Public_sans]">IGNORED WASTE CRISIS</h1>
            <p className="text-xl font-[Roboto]">Overflowing bins, illegal dumps, and zero follow-up on complaints. These problems persist because citizens have no reliable way to report or track them.</p>
          </div>
        </div>
      </section>
      <section className="py-8">
        <div className="max-w-[1340px] mx-auto flex justify-between items-center">
          <div className="title4Container w-2/5">
            <h1 className="text-4xl font-[1000] mb-4 font-[Public_sans]">FROM CLICK TO CLEANUP</h1>
            <p className="text-xl font-[Roboto]">TrashTrack bridges the gap by letting users report waste, pin it on a map, and create public visibility. This prompts faster action from local bodies.</p>
          </div>
          <div className="imgContainer3">
            <div>
              <Image className="rounded-xl" src="/assets/images/image9.jpg" alt="logo" height="512" width="512" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About