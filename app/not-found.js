"use client"
import { useAppContext } from "@/context/AppContext"
import React, { useEffect } from "react"
import { BsCloudSlashFill } from "react-icons/bs"
import { IoMdArrowRoundBack } from "react-icons/io"
import { useRouter } from "next/navigation"

const NotFound = () => {
  const { setIsPageLoaded } = useAppContext()
  const router = useRouter()

  function handleGoBack() {
    if (window.history.length > 1) window.history.back()
    else router.replace("/")
  }

  useEffect(() => {
    const handleLoad = () => requestAnimationFrame(() => setIsPageLoaded(true))

    if (document.readyState === "complete") handleLoad()
    else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  return (
    <main className="flex-1 p-4 flex max-md:flex-col items-center justify-center gap-16 max-lg:gap-8 max-md:gap-6">
      <div className="left relative font-[Public_sans] w-1/3 max-xl:w-2/5 max-lg:w-[45%] max-md:w-3/5 max-sm:w-4/5 max-[30rem]:w-full pt-24 max-md:pt-20 pb-12 pl-8 flex flex-col items-end text-gray-600 overflow-hidden shadow-lg select-none">
        <div className="bg absolute top-0 h-full w-full">
          <BsCloudSlashFill className="absolute top-2 right-2 h-32 w-32 max-lg:h-28 max-lg:w-28 max-md:h-24 max-md:w-24 text-[var(--primary-color)]/50" />
          <div className="absolute -left-24 -bottom-12 max-md:-bottom-16 rounded-full h-48 aspect-square max-lg:h-44 bg-[var(--primary-color)]/50"></div>
        </div>
        <div className="h-full w-full z-10">
          <h2 className="text-3xl max-lg:text-2xl font-bold ml-14 max-lg:ml-12">ERROR</h2>
          <h1 className="text-[10rem] max-lg:text-[9rem] max-[30rem]:text-9xl leading-[.75] font-bold">404</h1>
        </div>
      </div>
      <div className="right font-[Public_sans] w-2/5 max-lg:w-[45%] max-md:w-full flex flex-col items-start gap-6 max-md:gap-3">
        <h2 className="text-4xl max-lg:text-3xl max-[30rem]:text-2xl font-bold">Looks like you&apos;ve found the doorway to the great nothing</h2>
        <p className="text-xl max-lg:text-lg max-[30rem]:text-base font-semibold">The content you&apos;re looking for doesn&apos;t exist. Either it was removed, or you mistyped the link.</p>
        <div className="flex gap-8 max-lg:gap-6 max-[30rem]:!text-base">
          <button onClick={() => router.replace("/")} className="primaryBtn">Go To Home</button>
          <button onClick={handleGoBack} className="relative group primaryBtn !bg-transparent !text-[var(--primary-color)] border-2 border-[var(--primary-color)] flex items-center overflow-hidden">
            <IoMdArrowRoundBack size={20} className="absolute -left-5 group-hover:left-3 transition-all duration-300" />
            <div className="group-hover:pl-5 transition-all duration-300">Go Back</div>
          </button>
        </div>
      </div>
    </main>
  )
}

export default NotFound