"use client"
import React, { createContext, useState, useEffect, useContext, useRef } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export const AuthProvider = ({ children, token }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const intervalRef = useRef(null)
  const router = useRouter()
  const [isAuthCycleOn, setIsAuthCycleOn] = useState(false)
  const [displayNavLinks, setDisplayNavLinks] = useState(false)

  const startAuthCheckInterval = () => {
    if (!intervalRef.current) intervalRef.current = setInterval(checkAuth, 600000)
  }

  const stopAuthCheckInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const logutHelper = () => {
    stopAuthCheckInterval()
    setIsAuthCycleOn(false)
    toast.error("Session expired!")
    setIsLoggedIn(false)
    setUser(null)
    router.replace("/login")
  }

  const checkAuth = async () => {
    try {
      await fetch("/api/auth", { cache: "no-store" })
        .then(res => res.json())
        .then(data => {
          if (data.authenticated) {
            setIsLoggedIn(true)
            setUser(data.user)
            startAuthCheckInterval()
            setIsAuthCycleOn(true)
          } else {
            logutHelper()
          }
        })
    } catch {
      logutHelper()
    }
  }

  useEffect(() => {
    if (token) {
      checkAuth()
      return stopAuthCheckInterval
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, isPageLoaded, setIsPageLoaded, checkAuth, stopAuthCheckInterval, isAuthCycleOn, setIsAuthCycleOn, displayNavLinks, setDisplayNavLinks }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAppContext = () => useContext(AuthContext)