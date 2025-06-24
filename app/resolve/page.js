"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useAppContext } from "@/context/AppContext"
import BtnLoader from "@/components/loaders/btnLoader/BtnLoader"

const Resolve = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const searchParams = useSearchParams()
  const reportId = searchParams.get("reportId")
  const [report, setReport] = useState(null)
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  })
  const router = useRouter()
  const { user, setIsPageLoaded } = useAppContext()
  const [isSubmittingData, setIsSubmittingData] = useState(false)

  useEffect(() => {
    if (!reportId) {
      toast.error("Something went wrong!")
      router.replace("/dashboard")
    }

    const fetchReport = async () => {
      try {
        await fetch(`/api/report?reportId=${reportId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setReport(data.report)
            } else {
              toast.error(data.message)
            }
          })
      } catch (err) {
        console.error("Error fetching reports : ", err)
        toast.error("Something went wrong!")
        router.replace("/dashboard")
      }
    }

    const init = async () => {
      await fetchReport()
      const handleLoad = () => requestAnimationFrame(() => setIsPageLoaded(true))

      if (document.readyState === "complete") handleLoad()
      else {
        window.addEventListener("load", handleLoad)
      }
    }
    init()

    return () => window.removeEventListener("load", () => requestAnimationFrame(() => setIsPageLoaded(true)))
  }, [reportId])

  const onSubmit = async (data) => {
    try {
      setIsSubmittingData(true)
      const imageFiles = Object.entries(images).reduce((acc, [key, value]) => {
        if (value !== "No file chosen" && value instanceof File) acc[key] = value
        return acc
      }, {})

      if (Object.keys(imageFiles).length === 0) {
        toast.error("At least one image is required!")
        return
      }

      const formattedData = {
        officerResponse: data.officerResponse,
        resolvedBy: user?.email
      }

      const formData = new FormData()
      for (const key in formattedData) {
        if (formattedData[key] !== undefined && formattedData[key] !== null) formData.append(key, formattedData[key])
      }

      for (const key in imageFiles) formData.append(key, imageFiles[key])

      await fetch(`api/report/resolve?reportId=${reportId}`, {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast.success(data.message, {
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
      console.error("Error submitting resolution : ", err)
      toast.error("Error submitting resolution!")
    } finally {
      setIsSubmittingData(false)
    }
  }

  const handleImageInputChange = (e, imgKey) => {
    const image = e.target.files[0]

    if (image && !image.type.startsWith("image/")) {
      alert("Only images are allowed.")
      e.target.value = null
      return
    }

    if (!image || image.size > 8 * 1024 * 1024) {
      toast.error("File too large! Max size is 8 MB.")
      e.target.value = null
      setImages((prev) => ({ ...prev, [imgKey]: "No file chosen" }))
      setValue(imgKey, null)
      return
    }

    setImages((prev) => ({ ...prev, [imgKey]: image || "No file chosen" }))
    setValue(imgKey, image)
  }

  const CustomImageInput = ({ name }) => (
    <div className="w-full border-2 border-[var(--primary-color)]/25 focus-within:border-[var(--primary-color)] transition-all rounded-xl p-2 bg-white">
      <div className="flex items-center justify-between">
        <span className="truncate block max-w-[70%]" title={images[name]?.name || "No file chosen"}>
          {images[name]?.name || "No file chosen"}
        </span>
        <label className="primaryBtn actionBtn relative overflow-hidden cursor-pointer whitespace-nowrap px-4 py-2">
          Upload
          <input type="file" accept="image/*" onChange={(e) => handleImageInputChange(e, name)} className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer" />
        </label>
      </div>
    </div>
  )

  return (
    <main className="p-8 max-sm:p-6 font-[Public_sans] flex-1">
      <div className="loginFormContainer mx-auto w-xl max-lg:w-lg max-sm:w-md max-[35rem]:w-full bg-black/5 p-4 flex flex-col gap-4 rounded-md shadow-lg">
        <h1 className="text-2xl max-sm:text-xl font-[1000] w-full text-center">RESOLVE</h1>
        <p className="text-justify"><span className="font-semibold">TITLE : </span>{report?.title}</p>
        <p className="text-justify"><span className="font-semibold">DESCRIPTION : </span>{report?.desc}</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="inputFieldContainer flex flex-col">
            <label className="mb-2 ml-4" htmlFor="officerResponse">Response <span className="text-red-500">*</span> :</label>
            <textarea {...register("officerResponse", { required: { value: true, message: "Response is required" }, minLength: { value: 10, message: "Minimum length is 10 characters" }, maxLength: { value: 1000, message: "Maximum length is 1000 characters" } })} rows="3" className="resize-none border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" id="officerResponse" placeholder="Response" />
            {errors.officerResponse && <span className="text-red-500 text-sm">{errors.officerResponse.message}</span>}
          </div>

          <div className="mb-2">
            <label className="ml-4">Attach relevant images (At least one) :</label>
            <div className="mt-2 flex flex-col gap-2">
              {[1, 2, 3, 4].map(i => <CustomImageInput key={i} name={`image${i}`} />)}
            </div>
          </div>

          <div className="loadingBtnsWrappers relative w-fit group">
            <input disabled={isSubmittingData} className="primaryBtn" type="submit" value="SUBMIT" />
            {isSubmittingData && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all group-hover:scale-105 group-active:scale-100"><BtnLoader /></div>}
          </div>
        </form>
      </div>
    </main>
  )
}

export default Resolve