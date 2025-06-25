"use client"
import Link from "next/link"
import styles from "./header.module.css"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { useRouter } from "next/navigation"
import { deleteToken } from "@/app/deleteToken/actions"
import { usePathname } from "next/navigation"
import { RxHamburgerMenu } from "react-icons/rx"
import { useEffect, useRef } from "react"

const Header = () => {
  const { isLoggedIn, setIsLoggedIn, user, setIsPageLoaded, stopAuthCheckInterval, setIsAuthCycleOn, displayNavLinks, setDisplayNavLinks } = useAppContext()
  const router = useRouter()
  const pathName = usePathname()
  const navLinksContainerRef = useRef()
  const hamburgerRef = useRef()

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (displayNavLinks && navLinksContainerRef.current && !navLinksContainerRef.current.contains(e.target) && hamburgerRef.current && !hamburgerRef.current.contains(e.target)) setDisplayNavLinks(false)
    }

    const handleScroll = (e) => {
      if (displayNavLinks) setDisplayNavLinks(false)
    }

    document.addEventListener("click", handleOutsideClick)
    document.addEventListener("scroll", handleScroll)

    return () => {
      document.removeEventListener("click", handleOutsideClick)
      document.removeEventListener("scroll", handleScroll)
    }
  }, [displayNavLinks])

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
    <header className="p-4 max-[716px]:py-2 border-b-1">
      <div className="headerContentContainer max-w-[1600px] mx-auto flex justify-between items-center select-none relative">
        <div className="logoContainer">
          <Link onClick={(e) => handleLinkClick("/", e)} href="/">
            <div className="relative cursor-pointer h-16 w-64 max-[824px]:w-48">
              <Image src="/assets/images/logo2.png" alt="logo" fill style={{ objectFit: "contain" }} />
            </div>
          </Link>
        </div>
        <div ref={navLinksContainerRef} onClick={() => setDisplayNavLinks(false)} className={`${styles.navLinksContainer} ${displayNavLinks ? styles.show : ""}`}>
          <Link onClick={(e) => handleLinkClick("/about", e)} className={styles.navLinks} href="/about">ABOUT</Link>
          <Link onClick={(e) => handleLinkClick("/contact", e)} className={styles.navLinks} href="/contact">CONTACT US</Link>
          {isLoggedIn ?
            <>
              <Link onClick={(e) => handleLinkClick("/dashboard", e)} className={styles.navLinks} href="/dashboard">DASHBOARD</Link>
              {user?.role === "officer" && <Link onClick={(e) => handleLinkClick("/insights", e)} className={styles.navLinks} href="/insights">INSIGHTS</Link>}
              <button onClick={handleLogout} className={styles.navLinks}>LOG OUT</button>
            </> :
            <>
              <Link onClick={(e) => handleLinkClick("/login", e)} className={styles.navLinks} href="/login">LOGIN</Link>
              <Link onClick={(e) => handleLinkClick("/register", e)} className={styles.navLinks} href="/register">REGISTER</Link>
            </>
          }
        </div>
        <RxHamburgerMenu ref={hamburgerRef} className={styles.hamburger} onClick={() => setDisplayNavLinks(!displayNavLinks)} />
      </div>
    </header>
  )
}

export default Header