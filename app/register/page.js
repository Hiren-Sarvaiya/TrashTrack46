"use client"
import { useForm, Controller } from "react-hook-form"
import Select from "react-select"
import { useEffect, useState } from "react"
import { PiEye, PiEyeSlash } from "react-icons/pi"
import Link from "next/link"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import BtnLoader from "@/components/loaders/btnLoader/BtnLoader"
import ClientOnly from "@/components/ClientOnly"

const Register = () => {
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm()
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const router = useRouter()
  const { setIsLoggedIn, setUser, setIsPageLoaded } = useAppContext()
  const [isSubmittingData, setIsSubmittingData] = useState(false)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("/assets/data/citiesData.json")
        const citiesData = await res.json()

        const tempStates = Array.from(new Set(citiesData.map(city => city.state)))
          .sort((a, b) => a.localeCompare(b))
          .map(state => ({
            value: state.toLowerCase(),
            label: state
          }))
        setStates(tempStates)

        const tempCities = citiesData.reduce((acc, city) => {
          const state = city.state.toLowerCase()
          if (!acc[state]) acc[state] = []
          acc[state].push({ value: city.name.toLowerCase(), label: city.name })
          return acc
        }, {})
        setCities(tempCities)
      } catch (err) {
        console.error("Error fetching city data : ", err)
      }
    }

    const init = async () => {
      await fetchCities()
      const handleLoad = () => requestAnimationFrame(() => setIsPageLoaded(true))

      if (document.readyState === "complete") handleLoad()
      else {
        window.addEventListener("load", handleLoad)
      }
    }
    init()

    return () => window.removeEventListener("load", () => requestAnimationFrame(() => setIsPageLoaded(true)))
  }, [])

  const onSubmit = async (data) => {
    try {
      setIsSubmittingData(true)
      const formattedData = {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        role: data.role?.value,
        password: data.password,
        address: data.address,
        state: data.state?.value,
        city: data.city?.value,
        pincode: data.pincode
      }

      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      }).then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsLoggedIn(true)
            setUser(data.user)
            toast.success("Registration successful", {
              onClose: () => {
                setIsPageLoaded(false)
                router.replace("/dashboard")
              }
            })
          } else {
            toast.error(data.message)
          }
        })
      console.log(formattedData)
    } catch (err) {
      console.error("Error registering user : ", err)
      toast.error("Error registering user!")
    } finally {
      setIsSubmittingData(false)
    }
  }

  const roles = [
    { value: "citizen", label: "Citizen" },
    { value: "officer", label: "Officer" }
  ]

  return (
    <main className="p-8 font-[Public_sans]">
      <section>
        <div className="loginFormContainer mx-auto w-1/3 bg-black/5 p-4 flex flex-col gap-4 rounded-md shadow-lg">
          <h1 className="text-2xl font-[1000] w-full text-center">REGISTER</h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="inputFieldContainer flex flex-col">
              <label className="mb-2 ml-4" htmlFor="name">Full Name <span className="text-red-500">*</span> :</label>
              <input {...register("name", { required: { value: true, message: "Name is required" }, minLength: { value: 4, message: "Minimum length is 4 characters" }, maxLength: { value: 50, message: "Maximum length is 50 characters" } })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-black/25" type="text" id="name" placeholder="Full Name" />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>

            <div className="inputFieldContainer flex flex-col">
              <label className="mb-2 ml-4" htmlFor="email">Email <span className="text-red-500">*</span> :</label>
              <input {...register("email", { required: { value: true, message: "Email is required" }, pattern: { value: "/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/", value: "Invalid email" } })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-black/25" type="email" id="email" placeholder="Email" />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>

            <div className="inputFieldContainer flex flex-col">
              <label className="mb-2 ml-4" htmlFor="mobile">Mobile No <span className="text-red-500">*</span> :</label>
              <input {...register("mobile", { required: { value: true, message: "Mobile No is required" }, pattern: { value: /^[0-9]{10}$/, message: "Invalid mobile no" } })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10)} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" type="number" id="mobile" placeholder="Mobile No" />
              {errors.mobile && <span className="text-red-500 text-sm">{errors.mobile.message}</span>}
            </div>

            <div className="inputFieldContainer">
              <label className="ml-4" htmlFor="role">Role <span className="text-red-500">*</span> :</label>
              <div className="mt-2">
                <Controller name="role" id="role" control={control} rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <ClientOnly>
                      <Select {...field} options={roles} isSearchable={false} className="w-full text-black" classNamePrefix="customSelect" placeholder="Select" />
                    </ClientOnly>
                  )}
                />
                {errors.role && <span className="text-red-500 text-sm">{errors.role.message}</span>}
              </div>
            </div>

            <div className="inputFieldContainer flex flex-col">
              <label className="mb-2 ml-4" htmlFor="password">Password <span className="text-red-500">*</span> :</label>
              <div className="relative">
                <input {...register("password", { required: { value: true, message: "Password is required" }, minLength: { value: 8, message: "Minimum length is 8 characters" }, maxLength: { value: 20, message: "Maximum length is 20 characters" }, pattern: { value: /^(?=.*[@#$^&_-])[A-Za-z0-9@#$^&_-]+$/, message: "Use letters, numbers, and @, #, $, ^, &, or -." } })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-black/25 w-full" type={showPassword1 ? "text" : "password"} id="password" placeholder="Password" />
                {showPassword1 ?
                  <PiEye size="2rem" className="absolute top-1/2 -translate-y-1/2 right-2 text-[var(--primary-color)] cursor-pointer" onClick={() => setShowPassword1(!showPassword1)} /> :
                  <PiEyeSlash size="2rem" className="absolute top-1/2 -translate-y-1/2 right-2 text-[var(--primary-color)] cursor-pointer" onClick={() => setShowPassword1(!showPassword1)} />
                }
              </div>
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>

            <div className="inputFieldContainer flex flex-col">
              <label className="mb-2 ml-4" htmlFor="cPassword">Confirm Password <span className="text-red-500">*</span> :</label>
              <div className="relative">
                <input {...register("cPassword", { required: { value: true, message: "Password is required" }, validate: value => value === watch("password") || "Passwords do not match" })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-black/25 w-full" type={showPassword2 ? "text" : "password"} id="cPassword" placeholder="Confirm Password" />
                {showPassword2 ?
                  <PiEye size="2rem" className="absolute top-1/2 -translate-y-1/2 right-2 text-[var(--primary-color)] cursor-pointer" onClick={() => setShowPassword2(!showPassword2)} /> :
                  <PiEyeSlash size="2rem" className="absolute top-1/2 -translate-y-1/2 right-2 text-[var(--primary-color)] cursor-pointer" onClick={() => setShowPassword2(!showPassword2)} />
                }
              </div>
              {errors.cPassword && <span className="text-red-500 text-sm">{errors.cPassword.message}</span>}
            </div>

            <div className="inputFieldContainer flex flex-col">
              <label className="mb-2 ml-4" htmlFor="address">Address <span className="text-red-500">*</span> :</label>
              <textarea {...register("address", { required: { value: true, message: "Address is required" }, minLength: { value: 10, message: "Minimum length is 10 characters" }, maxLength: { value: 200, message: "Maximum length is 200 characters" } })} rows="3" className="resize-none border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" id="address" placeholder="Address" />
              {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
            </div>

            <div className="inputFieldContainer">
              <label className="ml-4" htmlFor="state">State <span className="text-red-500">*</span> :</label>
              <div className="mt-2">
                <Controller name="state" id="state" control={control}
                  render={({ field }) => (
                    <ClientOnly>
                      <Select {...field} options={states} isSearchable={false} className="w-full text-black" classNamePrefix="customSelect" placeholder="Select" />
                    </ClientOnly>
                  )}
                />
              </div>
            </div>

            <div className="inputFieldContainer">
              <label className="ml-4" htmlFor="city">City <span className="text-red-500">*</span> :</label>
              <div className="mt-2">
                <Controller name="city" id="city" control={control}
                  render={({ field }) => (
                    <ClientOnly>
                      <Select {...field} options={(cities[watch("state")?.value] || []).sort((a, b) => a.label.localeCompare(b.label))} isSearchable={false} className="w-full text-black" classNamePrefix="customSelect" placeholder="Select" noOptionsMessage={() => watch("state")?.value ? "No cities available" : "Select a state first"} />
                    </ClientOnly>
                  )}
                />
              </div>
            </div>

            <div className="inputFieldContainer flex flex-col">
              <label className="mb-2 ml-4" htmlFor="pincode">Pin Code <span className="text-red-500">*</span> :</label>
              <input {...register("pincode", { required: { value: true, message: "Pin code is required" }, pattern: { value: /^[0-9]{6}$/, message: "Enter exactly 6 digits" } })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" type="number" id="pincode" placeholder="Pin Code" />
              {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
            </div>

            <div className="loadingBtnsWrappers relative w-fit group">
              <input disabled={isSubmittingData} className="primaryBtn" type="submit" value="SUBMIT" />
              {isSubmittingData && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all group-hover:scale-105 group-active:scale-100"><BtnLoader /></div>}
            </div>
            <p className="text-center">Already registered? <Link className="link" href="/login">Login</Link></p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Register