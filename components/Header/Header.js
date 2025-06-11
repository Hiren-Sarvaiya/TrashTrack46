"use client"
import Link from "next/link"
import styles from "./header.module.css"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { useRouter } from "next/navigation"
import { deleteToken } from "@/app/deleteToken/actions"
import { usePathname } from "next/navigation"

const Header = () => {
  const { isLoggedIn, setIsLoggedIn, user, setIsPageLoaded, stopAuthCheckInterval, setIsAuthCycleOn } = useAppContext()
  const router = useRouter()
  const pathName = usePathname()

  const handleLinkClick = (link, e) => {
    if (pathName === link) e.preventDefault()
    else setIsPageLoaded(false)
  }

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
          <Link onClick={(e) => handleLinkClick("/", e)} className="cursor-pointer" href="/"><Image src="/assets/images/logo2.png" alt="logo" height="256" width="256" /></Link>
        </div>
        <div className="navLinksContainer flex gap-6 font-[500]">
          <Link onClick={(e) => handleLinkClick("/about", e)} className={styles.navLinks} href="/about">ABOUT</Link>
          <Link onClick={(e) => handleLinkClick("/contact", e)} className={styles.navLinks} href="/contact">CONTACT US</Link>
          {isLoggedIn ?
            <>
              <Link onClick={(e) => handleLinkClick("/dashboard", e)} className={styles.navLinks} href="/dashboard">DASHBOARD</Link>
              {user && user.role && user.role === "officer" && <Link onClick={(e) => handleLinkClick("/insights", e)} className={styles.navLinks} href="/insights">INSIGHTS</Link>}
              <button onClick={handleLogout} className={styles.navLinks}>LOG OUT</button>
            </> :
            <>
              <Link onClick={(e) => handleLinkClick("/login", e)} className={styles.navLinks} href="/login">LOGIN</Link>
              <Link onClick={(e) => handleLinkClick("/register", e)} className={styles.navLinks} href="/register">REGISTER</Link>
            </>
          }
        </div>
      </div>
    </header>
  )
}

export default Header