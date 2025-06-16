"use client"
import { useForm, Controller } from "react-hook-form"
import Select from "react-select"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import LeafletMap from "@/components/MapPicker"
import styles from "./report.module.css"
import BtnLoader from "@/components/loaders/btnLoader/BtnLoader"
import ClientOnly from "@/components/ClientOnly"

const Report = () => {
  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm()
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [position, setPosition] = useState(null)
  const { user, setIsPageLoaded } = useAppContext()
  const router = useRouter()
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  })
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

  const onSubmit = async (data) => {
    try {
      setIsSubmittingData(true)
      const imageFiles = Object.entries(images).reduce((acc, [key, value]) => {
        if (value !== "No file chosen" && value instanceof File) { acc[key] = value }
        return acc
      }, {})

      if (!(Object.values(images).some((img) => img && img !== "No file chosen" && img instanceof File))) {
        toast.error("At least one image is required!")
        return
      }

      const formattedData = {
        title: data.title,
        desc: data.desc,
        category: data.category?.value,
        address: data.address,
        state: data.state?.value,
        city: data.city?.value,
        pincode: data.pincode,
        latitude: position?.[0],
        longitude: position?.[1],
        images: imageFiles,
        submittedBy: user?.email,
        isAnonymous: watch("isAnonymous")
      }

      const formData = new FormData()
      for (const key in formattedData) {
        if (key === "images") {
          Object.entries(formattedData.images).forEach(([imgKey, file]) => {
            formData.append(imgKey, file)
          })
        } else if (formattedData[key] !== undefined && formattedData[key] !== null) {
          formData.append(key, formattedData[key])
        }
      }

      await fetch("/api/report", {
        method: "POST",
        body: formData
      }).then(res => res.json())
        .then(data => {
          if (data.success) {
            toast.success(data.message, {
              onClose: () => {
                setIsPageLoaded(false)
                router.push("/dashboard")
              }
            })
          } else toast.error(data.message)
        })
      console.log(formattedData)
    } catch (err) {
      console.error("Error submitting report : ", err)
      toast.error("Error submitting report!")
    } finally {
      setIsSubmittingData(false)
    }
  }

  const reportCategories = [
    { value: "road_dump", label: "Garbage dumped on road" },
    { value: "unpicked_garbage", label: "Garbage not picked up for days" },
    { value: "overflowing_dustbin", label: "Overflowing public dustbin" },
    { value: "near_water_body", label: "Garbage near water body" },
    { value: "dead_animal", label: "Dead animal not removed" },
    { value: "illegal_dumping", label: "Illegal dumping of waste" },
    { value: "industrial_waste", label: "Industrial or chemical waste" },
    { value: "open_dumpyard", label: "Open or unregulated dump yard" },
    { value: "hospital_waste", label: "Hazardous medical waste" },
    { value: "market_waste", label: "Waste around market/vendor zones" },
    { value: "wastewater_leak", label: "Leakage of wastewater or sewage" }
  ]

  useEffect(() => {
    register("latitude")
    register("longitude")
  }, [register])

  useEffect(() => {
    if (useCurrentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = [pos.coords.latitude, pos.coords.longitude]
            setPosition(coords)
            setValue("latitude", coords[0])
            setValue("longitude", coords[1])
          },
          () => {
            toast.error("Cannot get your location")
            setUseCurrentLocation(false)
          }
        )
      }
    }
  }, [useCurrentLocation])

  useEffect(() => {
    register("image1")
    register("image2")
    register("image3")
    register("image4")
  }, [register])

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
    <main className="p-8">
      <div className="loginFormContainer mx-auto w-1/3 bg-black/5 p-4 flex flex-col gap-4 rounded-md shadow-lg">
        <h1 className="text-2xl font-[1000] w-full text-center">REPORT</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="inputFieldContainer flex flex-col">
            <label className="mb-2 ml-4" htmlFor="title">Title <span className="text-red-500">*</span> :</label>
            <input {...register("title", { required: { value: true, message: "Title is required" }, minLength: { value: 5, message: "Minimum length is 5 characters" }, maxLength: { value: 100, message: "Maximum length is 100 characters" } })} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3 disabled:cursor-not-allowed disabled:bg-black/25" type="text" id="title" placeholder="Title" />
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>

          <div className="inputFieldContainer flex flex-col">
            <label className="mb-2 ml-4" htmlFor="desc">Description <span className="text-red-500">*</span> :</label>
            <textarea {...register("desc", { required: { value: true, message: "Description is required" }, minLength: { value: 10, message: "Minimum length is 10 characters" }, maxLength: { value: 1000, message: "Maximum length is 1000 characters" } })} rows="3" className="resize-none border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" id="desc" placeholder="Description" />
            {errors.desc && <span className="text-red-500 text-sm">{errors.desc.message}</span>}
          </div>

          <div className="inputFieldContainer">
            <label className="ml-4" htmlFor="category">Category <span className="text-red-500">*</span> :</label>
            <div className="mt-2">
              <Controller name="category" id="category" control={control} rules={{ required: "State is required" }}
                render={({ field }) => (
                  <ClientOnly>
                    <Select {...field} options={reportCategories} isSearchable={false} className="w-full text-black" classNamePrefix="customSelect" placeholder="Select" />
                  </ClientOnly>
                )}
              />
              {errors.desc && <span className="text-red-500 text-sm">{errors.desc.message}</span>}
            </div>
          </div>

          <div className="inputFieldContainer flex flex-col">
            <label className="mb-2 ml-4" htmlFor="address">Address <span className="text-red-500">*</span> :</label>
            <textarea {...register("address", { required: { value: true, message: "Address is required" }, minLength: { value: 10, message: "Minimum length is 10 characters" }, maxLength: { value: 200, message: "Maximum length is 200 characters" } })} rows="3" className="resize-none border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" id="address" placeholder="Address" />
            {errors.address && <span className="text-red-500 text-sm">{errors.address.message}</span>}
          </div>

          <div className="inputFieldContainer">
            <label className="ml-4" htmlFor="state">State <span className="text-red-500">*</span> :</label>
            <div className="mt-2">
              <Controller name="state" id="state" control={control} rules={{ required: "State is required" }}
                render={({ field }) => (
                  <ClientOnly>
                    <Select {...field} options={states} isSearchable={false} className="w-full text-black" classNamePrefix="customSelect" placeholder="Select" />
                  </ClientOnly>
                )}
              />
              {errors.state && <span className="text-red-500 text-sm">{errors.state.message}</span>}
            </div>
          </div>

          <div className="inputFieldContainer">
            <label className="ml-4" htmlFor="city">City <span className="text-red-500">*</span> :</label>
            <div className="mt-2">
              <Controller name="city" id="city" control={control} rules={{ required: "City is required" }}
                render={({ field }) => (
                  <ClientOnly>
                    <Select {...field} options={cities[watch("state")?.value] || []} isSearchable={false} className="w-full text-black" classNamePrefix="customSelect" placeholder="Select" noOptionsMessage={() => watch("state")?.value ? "No cities available" : "Select a state first"} />
                  </ClientOnly>
                )}
              />
              {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
            </div>
          </div>

          <div className="inputFieldContainer flex flex-col">
            <label className="mb-2 ml-4" htmlFor="pincode">Pin Code <span className="text-red-500">*</span> :</label>
            <input {...register("pincode", { required: { value: true, message: "Pin code is required" }, pattern: { value: /^[0-9]{6}$/, message: "Enter exactly 6 digits" } })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)} className="border-2 bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-3" type="number" id="pincode" placeholder="Pin Code" />
            {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
          </div>

          <div className="inputFieldContainer flex flex-col mb-2">
            <label className="mb-2 ml-4">Location :</label>
            <div className="border-2 border-[var(--primary-color)]/25 focus-within:border-[var(--primary-color)] transition-all rounded-xl overflow-hidden">
              <LeafletMap position={position} setPosition={setPosition} onLocationSelect={(cords) => {
                setPosition(cords)
                setValue("latitude", cords[0])
                setValue("longitude", cords[1])
              }} />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <input type="checkbox" id="useLocation" className={styles.customCheckbox} checked={useCurrentLocation} onChange={() => setUseCurrentLocation(prev => !prev)} />
              <label htmlFor="useLocation">Use my current location</label>
            </div>
          </div>

          <div className="mb-2">
            <label className="ml-4">Attach relevant images (At least one) :</label>
            <div className="mt-2 flex flex-col gap-2">
              {[1, 2, 3, 4].map(i => <CustomImageInput key={i} name={`image${i}`} />)}
            </div>
          </div>

          <div className="checkboxContainer w-full">
            <label className="border-2 cursor-pointer bg-white border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl w-full p-2 cur-p flex items-center gap-2">
              <input className={styles.customCheckbox2} type="checkbox" {...register("isAnonymous")} />
              Report anonymously
            </label>
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

export default Report