"use client"
import { useAppContext } from "@/context/AppContext"
import PageLoader from "./loaders/pageLoader/PageLoader"
import { useEffect } from "react"

export default function ClientWrapper({ children }) {
  const { isPageLoaded } = useAppContext()

  useEffect(() => {
    if (isPageLoaded) {
      const html = document.documentElement
      const body = document.body
      html.style.overflow = ""
      body.style.overflow = ""
      html.style.height = ""
      body.style.height = ""
    }
  }, [isPageLoaded])

  return (
    <>
      {!isPageLoaded && (
        <style>
          {`
            html, body {
              overflow: hidden;
              height: 100%;
            }
          `}
        </style>
      )}
      <div className={`fixed top-0 left-0 h-dvh w-dvw flex justify-center items-center transition-all ${isPageLoaded ? "-z-20 bg-transparent" : "z-[999] bg-white"}`}>
        <div className={`pageLoaderContainer ${isPageLoaded ? "scale-0" : "scale-200"} transition-all`}>
          <PageLoader />
        </div>
      </div>
      {children}
    </>
  )
}