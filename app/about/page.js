"use client"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { useEffect, useState } from "react"

const About = () => {
  const { setIsPageLoaded } = useAppContext()
  const [imgLoadCount, setImgLoadCount] = useState(0)

  const totalImages = 6
  useEffect(() => {
    const handleLoad = () => requestAnimationFrame(() => {
      if (imgLoadCount === totalImages) setIsPageLoaded(true)
    })

    if (document.readyState === "complete") handleLoad()
    else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [imgLoadCount])

  return (
    <main>
      <section className="h-[50vh] max-[52rem]:h-[32vh] max-sm:h-[25vh] w-full bg-[url('/assets/images/image11.jpg')] relative bg-cover bg-center flex justify-center items-center">
        <div className="aboutHeadingContainer bg-[var(--primary-color)] w-fit px-8 py-12 max-[52rem]:px-6 max-[52rem]:py-10 max-sm:px-4 max-sm:py-8 max-[28rem]:px-3 max-[28rem]:py-7 rounded-[100px/30px] z-10">
          <h1 className="text-4xl max-[52rem]:text-3xl max-sm:text-3xl max-[28rem]:text-2xl font-[1000] text-white selection:!bg-white/75 selection:!text-[var(--primary-color)]">ABOUT TRASHTRACK</h1>
        </div>
        <div className="darkOverlay absolute top-0 h-full w-full bg-[var(--primary-color)] opacity-25"></div>
      </section>
      <section className="bg-black text-white px-6 py-10 max-[52rem]:px-4 max-[52rem]:py-8 max-[28rem]:py-6">
        <div className="max-w-[1340px] mx-auto flex max-[72rem]:flex-col max-[72rem]:gap-6 justify-between items-center">
          <div className="title2Container w-2/5 max-[72rem]:w-full selection:!bg-white/75 selection:!text-black">
            <h1 className="text-4xl max-lg:text-3xl max-md:text-2xl max-[28rem]:text-xl font-[1000] mb-4 max-[72rem]:mb-2 font-[Public_sans]">JOIN THE EFFORT TO KEEP OUR CITY CLEAN</h1>
            <p className="text-xl max-lg:text-base max-md:text-sm font-[Roboto]">Our platform is designed to empower responsible citizens and unite local communities in taking actionable steps towards a cleaner, eco-friendly environment.</p>
          </div>
          <div className="imgContainer relative w-fit z-10 max-[30rem]:w-full">
            <div className="flex max-[30rem]:flex-col items-center gap-2">
              <div className="relative w-72 aspect-[16/9] max-lg:w-60 max-[52rem]:w-64 max-sm:w-56 max-[35rem]:w-52 max-[30rem]:w-11/12">
                <Image onLoad={() => setImgLoadCount(prev => prev + 1)} className="rounded-lg" src="/assets/images/image2.jpg" alt="image" fill style={{ objectFit: "cover" }} />
              </div>
              <div className="flex max-[72rem]:flex-row max-[52rem]:flex-col max-[30rem]:w-full items-center flex-col gap-2">
                <div className="relative w-[21rem] aspect-[16/9] max-lg:w-72 max-sm:w-60 max-[35rem]:w-56 max-[30rem]:w-11/12">
                  <Image onLoad={() => setImgLoadCount(prev => prev + 1)} className="rounded-lg" src="/assets/images/image3.jpg" alt="image" fill style={{ objectFit: "cover" }} />
                </div>
                <div className="relative w-80 aspect-[16/9] max-[72rem]:w-72 max-lg:w-60 max-[52rem]:w-64 max-sm:w-56 max-[35rem]:w-52 max-[30rem]:w-11/12">
                  <Image onLoad={() => setImgLoadCount(prev => prev + 1)} className="rounded-lg" src="/assets/images/image4.jpg" alt="image" fill style={{ objectFit: "cover" }} />
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-1/2 -z-10 max-[72rem]:hidden max-[52rem]:block max-[30rem]:hidden w-32 aspect-square max-[52rem]:w-28 max-[35rem]:w-24 rounded-full bg-[var(--primary-color)]"></div>
          </div>
        </div>
      </section>
      <section className="px-6 py-10 max-[52rem]:px-4 max-[52rem]:py-8 max-[28rem]:py-6">
        <div className="max-w-[1340px] w-full mx-auto flex max-[30rem]:flex-col-reverse gap-2 justify-between items-center">
          <div className="imgContainer2 relative w-fit z-10 max-[30rem]:w-11/12">
            <div className="flex flex-col gap-4 max-[30rem]:items-center">
              <div className="relative w-96 aspect-[16/9] max-lg:w-80 max-md:w-72 max-sm:w-64 max-[35rem]:w-52 max-[30rem]:w-11/12">
                <Image onLoad={() => setImgLoadCount(prev => prev + 1)} className="rounded-ss-[8rem] rounded-se-xl rounded-ee-[8rem] max-lg:rounded-ss-[6rem] max-lg:rounded-ee-[6rem] max-md:rounded-ss-[6rem] max-md:rounded-ee-[6rem] max-sm:rounded-ss-[4rem] max-sm:rounded-ee-[4rem]" src="/assets/images/image5.jpg" alt="image" fill style={{ objectFit: "cover" }} />
              </div>
              <div className="relative w-96 aspect-[16/9] max-lg:w-80 max-md:w-72 max-sm:w-64 max-[35rem]:w-52 max-[30rem]:w-11/12">
                <Image onLoad={() => setImgLoadCount(prev => prev + 1)} className="rounded-es-[8rem] rounded-ee-xl rounded-se-[8rem] max-lg:rounded-es-[6rem] max-lg:rounded-se-[6rem] max-md:rounded-es-[6rem] max-md:rounded-se-[6rem] max-sm:rounded-es-[4rem] max-sm:rounded-se-[4rem]" src="/assets/images/image6.jpg" alt="image" fill style={{ objectFit: "cover" }} />
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4 -z-10 w-32 aspect-square max-lg:w-28 max-md:w-24 max-sm:w-20 max-[30rem]:w-1/4 rounded-full bg-[var(--primary-color)]"></div>
          </div>
          <div className="title3Container w-2/5 max-xl:w-1/2 max-[30rem]:w-full">
            <h1 className="text-4xl max-lg:text-3xl max-md:text-2xl max-[28rem]:text-xl font-[1000] mb-4 max-[72rem]:mb-2 font-[Public_sans]">IGNORED WASTE CRISIS</h1>
            <p className="text-xl max-lg:text-base max-md:text-sm font-[Roboto]">Overflowing bins, illegal dumps, and zero follow-up on complaints. These problems persist because citizens have no reliable way to report or track them.</p>
          </div>
        </div>
      </section>
      <section className="px-6 pb-10 max-[52rem]:px-4 max-[52rem]:pt-0 max-[52rem]:pb-8 max-[28rem]:pt-2 max-[28rem]:pb-6">
        <div className="max-w-[1340px] mx-auto flex max-[30rem]:flex-col gap-2 justify-between items-center">
          <div className="title4Container w-2/5 max-xl:w-1/2 max-[30rem]:w-full">
            <h1 className="text-4xl max-lg:text-3xl max-md:text-2xl max-[28rem]:text-xl font-[1000] mb-4 max-[72rem]:mb-2 font-[Public_sans]">FROM CLICK TO CLEANUP</h1>
            <p className="text-xl max-lg:text-base max-md:text-sm font-[Roboto]">TrashTrack bridges the gap by letting users report waste, pin it on a map, and create public visibility. This prompts faster action from local bodies.</p>
          </div>
          <div className="imgContainer3 max-[30rem]:w-full">
            <div className="relative w-96 aspect-[16/9] max-lg:w-80 max-md:w-72 max-sm:w-64 max-[30rem]:w-11/12 max-[30rem]:mx-auto">
              <Image onLoad={() => setImgLoadCount(prev => prev + 1)} className="rounded-xl" src="/assets/images/image7.jpg" alt="image" fill style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About