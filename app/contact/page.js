"use client"
import { IoLogoGithub } from "react-icons/io"
import { FaLinkedin } from "react-icons/fa"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useAppContext } from "@/context/AppContext"
import { useEffect, useState } from "react"

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { setIsPageLoaded } = useAppContext()
  const [rows, setRows] = useState(7)

  useEffect(() => {
    const handleLoad = () => requestAnimationFrame(() => setIsPageLoaded(true))

    if (document.readyState === "complete") handleLoad()
    else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  useEffect(() => {
    const updateRows = () => {
      const width = window.innerWidth
      if (width <= 768) setRows(4)
      else if (width <= 1024) setRows(5)
      else setRows(7)
    }

    updateRows()
    window.addEventListener("resize", updateRows)

    return () => window.removeEventListener("resize", updateRows)
  }, [])

  const onSubmit = (data) => {
    console.log(data)
    reset()
  }

  return (
    <main className="p-8 flex-1">
      <section className="max-w-[1340px] mx-auto flex max-md:flex-col max-md:gap-4 justify-between items-center">
        <div className="title4Container text-center w-2/5 max-xl:w-1/2 max-md:w-4/5 max-[30rem]:w-full">
          <h1 className="text-4xl max-lg:text-3xl max-md:text-2xl font-[1000] mb-4 max-lg:mb-2 font-[Public_sans]">ANY QUERIES</h1>
          <p className="text-lg max-lg:text-base max-md:text-sm font-[Roboto]">Get in touch with TrashTrack to learn more about our services and initiatives in promoting a cleaner and healthier city.</p>
        </div>
        <div className="formContainer w-2/5 max-xl:w-[45%] max-md:w-4/5 max-[30rem]:w-full">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="inputFieldContainer flex flex-col">
              <label className="mb-4" htmlFor="name">Name :</label>
              <input {...register("name", { required: { value: true, message: "Name is required" } })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" type="text" id="name" placeholder="Name" />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
            <div className="inputFieldContainer flex flex-col">
              <label className="mb-4" htmlFor="email">Email :</label>
              <input {...register("email", { required: { value: true, message: "Email is required" }, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: "Invalid email" } })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" type="email" id="email" placeholder="Email" />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
            <div className="inputFieldContainer flex flex-col">
              <label className="mb-4" htmlFor="message">Message :</label>
              <textarea {...register("message", { required: { value: true, message: "Message is required" }, minLength: { value: 20, message: "Minimum length is 20 characters" }, maxLength: { value: 300, message: "Maximum length is 300 characters" } })} rows={rows} className="resize-none border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" id="message" placeholder="Message" />
              {errors.message && <span className="text-red-500 text-sm">{errors.message.message}</span>}
            </div>
            <input className="primaryBtn" type="submit" value="SUBMIT" />
          </form>
          <div className="socialMediaLinks w-full flex justify-end">
            <Link href="https://www.github.com/Hiren-Sarvaiya" target="_blank" className="mr-4">
              <IoLogoGithub size="2.5rem" fill="#262932" className="cursor-pointer" />
            </Link>
            <Link href="https://www.linkedin.com/in/hiren-sarvaiya-3562442aa" target="_blank" className="mr-4">
              <FaLinkedin size="2.5rem" fill="#262932" className="cursor-pointer" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Contact