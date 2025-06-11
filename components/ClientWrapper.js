"use client"
import { useAppContext } from "@/context/AppContext"
import Loader from "@/components/loaders/Loader"

export default function ClientWrapper({ children }) {
  const { isPageLoaded } = useAppContext()

  return (
    <>
      <div className={`fixed top-0 left-0 w-dvw h-dvh flex justify-center items-center transition-all ${isPageLoaded ? "-z-20 bg-transparent" : "z-50 bg-white"}`}>
        <div className={`pageLoaderContainer ${isPageLoaded ? "scale-0" : "scale-200"} transition-all`}>
          <Loader />
        </div>
      </div>
      {children}
    </>
  )
}