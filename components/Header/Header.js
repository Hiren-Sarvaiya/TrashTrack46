"use client"
import Link from "next/link"
import styles from "./header.module.css"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { useRouter } from "next/navigation"
import { deleteToken } from "@/app/deleteToken/actions"

const Header = () => {
  const { isLoggedIn, setIsLoggedIn, setIsPageLoaded, stopAuthCheckInterval, setIsAuthCycleOn } = useAppContext()
  const router = useRouter()
  const handleLogout = async () => {
    stopAuthCheckInterval()
    setIsAuthCycleOn(false)
    setIsLoggedIn(false)
    deleteToken()
    setIsPageLoaded(false)
    router.replace("/")
    router.refresh()
  }

  return (
    <header className="p-4 border-b-1">
      <div className="headerContentContainer max-w-[1600px] mx-auto flex justify-between items-center select-none">
        <div className="logoContainer">
          <Link onClick={() => setIsPageLoaded(false)} className="cursor-pointer" href="/"><Image src="/assets/images/logo2.png" alt="logo" height="256" width="256" /></Link>
        </div>
        <div className="navLinksContainer flex gap-6 font-[500]">
          <Link onClick={() => setIsPageLoaded(false)} className={styles.navLinks} href="/about">ABOUT</Link>
          <Link onClick={() => setIsPageLoaded(false)} className={styles.navLinks} href="/contact">CONTACT US</Link>
          {isLoggedIn ?
            <>
              <Link onClick={() => setIsPageLoaded(false)} className={styles.navLinks} href="/dashboard">DASHBOARD</Link>
              <button onClick={handleLogout} className={styles.navLinks}>LOG OUT</button>
            </> :
            <>
              <Link onClick={() => setIsPageLoaded(false)} className={styles.navLinks} href="/login">LOGIN</Link>
              <Link onClick={() => setIsPageLoaded(false)} className={styles.navLinks} href="/register">REGISTER</Link>
            </>
          }
        </div>
      </div>
    </header>
  )
}

export default Header