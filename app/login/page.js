"use client"
import { useForm, Controller } from "react-hook-form"
import Select from "react-select"
import { useState } from "react"
import { PiEye, PiEyeSlash } from "react-icons/pi"
import Link from "next/link"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import BtnLoader from "@/components/loaders/btnLoader/BtnLoader"
import { useEffect } from "react"
import ClientOnly from "@/components/ClientOnly"

const Login = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm()
  const [loginMethod, setLoginMethod] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setIsLoggedIn, setUser, setIsPageLoaded, checkAuth } = useAppContext()
  const [isSubmittingData, setIsSubmittingData] = useState(false)

  useEffect(() => {
    const handleLoad = () => requestAnimationFrame(() => setIsPageLoaded(true))

    if (document.readyState === "complete") handleLoad()
    else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  const onSubmit = async (data) => {
    try {
      document.activeElement.blur()
      setIsSubmittingData(true)
      const formattedData = {
        email: data.email,
        mobile: data.mobile,
        password: data.password
      }

      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      }).then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsLoggedIn(true)
            setUser(data.user)
            checkAuth()
            toast.success("Login successful", {
              onClose: () => {
                setIsPageLoaded(false)
                router.replace("/dashboard")
              }
            })
          } else {
            toast.error(data.message)
          }
        })
    } catch (err) {
      console.error("Error in login : ", err)
      toast.error("Error in login!")
    } finally {
      setIsSubmittingData(false)
    }
  }

  const loginMethods = [
    { value: "email", label: "Email" },
    { value: "mobile", label: "Mobile No" }
  ]

  return (
    <main className="p-8 max-sm:p-6 font-[Public_sans] flex-1">
      <section>
        <div className="loginFormContainer mx-auto w-xl max-lg:w-lg max-sm:w-md max-[35rem]:w-full bg-black/5 p-4 flex flex-col gap-4 rounded-md shadow-lg">
          <h1 className="text-2xl max-sm:text-xl font-[1000] w-full text-center">LOGIN</h1>
          <form className="flex flex-col gap-4 max-sm:text-sm" onSubmit={handleSubmit(onSubmit)}>
            <div className="inputFieldContainer">
              <label className="ml-4" htmlFor="loginMethod">Login Using :</label>
              <div className="mt-2">
                <Controller name="loginMethod" id="loginMethod" control={control}
                  render={({ field }) => (
                    <ClientOnly>
                      <Select {...field} options={loginMethods} isSearchable={false} className="w-full text-black" classNamePrefix="customSelect" placeholder="Select" onChange={(selectedOption) => { setLoginMethod(selectedOption.value) }} />
                    </ClientOnly>
                  )}
                />
              </div>
            </div>

            <div className={`inputFieldContainer flex flex-col ${(loginMethod === null || loginMethod === "email") ? "" : "hidden"}`}>
              <label className="mb-2 ml-4" htmlFor="email">Email <span className="text-red-500">*</span> :</label>
              <input disabled={loginMethod === null} {...register("email", { required: { value: loginMethod === "email" ? true : false, message: "Email is required" }, pattern: { value: "/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/", value: "Invalid email" } })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-black/25" type="email" id="email" placeholder="Email" />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>

            <div className={`inputFieldContainer flex flex-col ${loginMethod === "mobile" ? "" : "hidden"}`}>
              <label className="mb-2 ml-4" htmlFor="mobile">Mobile No <span className="text-red-500">*</span> :</label>
              <input {...register("mobile", { required: { value: loginMethod === "mobile", message: "Mobile No is required" }, pattern: { value: /^[0-9]{10}$/, message: "Enter exactly 10 digits" } })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10)} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3 no-spinner" type="number" id="mobile" placeholder="Mobile No" />
              {errors.mobile && <span className="text-red-500 text-sm">{errors.mobile.message}</span>}
            </div>

            <div className="inputFieldContainer flex flex-col">
              <label className="mb-2 ml-4" htmlFor="password">Password <span className="text-red-500">*</span> :</label>
              <div className="relative">
                <input disabled={loginMethod === null} {...register("password", { required: { value: true, message: "Password is required" }, minLength: { value: 8, message: "Minimum length is 8 characters" }, maxLength: { value: 20, message: "Maximum length is 20 characters" }, pattern: { value: /^(?=.*[@#$^&_-])[A-Za-z0-9@#$^&_-]+$/, message: "Use letters, numbers, and @, #, $, ^, &, or -." } })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-black/25 w-full" type={showPassword ? "text" : "password"} id="password" placeholder="Password" />
                {showPassword ?
                  <PiEye size="2rem" className={`absolute top-1/2 -translate-y-1/2 right-2 ${loginMethod === null ? "text-black pointer-events-none" : "text-[var(--primary-color)] cursor-pointer"}`} onClick={() => setShowPassword(!showPassword)} /> :
                  <PiEyeSlash size="2rem" className={`absolute top-1/2 -translate-y-1/2 right-2 ${loginMethod === null ? "text-black pointer-events-none" : "text-[var(--primary-color)] cursor-pointer"}`} onClick={() => setShowPassword(!showPassword)} />
                }
              </div>
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>

            <div className="loadingBtnsWrappers relative w-fit group">
              <input disabled={loginMethod === null || isSubmittingData} className={`primaryBtn ${loginMethod === null && "disabled:bg-[var(--primary-color)]! disabled:hover:bg-black/25! disabled:text-white!"}`} type="submit" value="SUBMIT" />
              {isSubmittingData && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all group-hover:scale-105 group-active:scale-100 max-sm:text-sm"><BtnLoader /></div>}
            </div>
            <p className="text-center">Don&apos;t have an account? <Link className="link" href="/register">Register</Link></p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Login