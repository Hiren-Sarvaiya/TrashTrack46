"use client"
import { useAppContext } from "@/context/AppContext"
import { useEffect, useState, useMemo } from "react"
import Select from "react-select"
import { toast } from "react-toastify"
import { CldImage } from "next-cloudinary"
import { useRouter } from "next/navigation"
import BtnLoader from "@/components/loaders/btnLoader/BtnLoader"
import ClientOnly from "./ClientOnly"

const OfficerDashboard = () => {
  const { user, setIsPageLoaded, isAuthCycleOn } = useAppContext()
  const [reports, setReports] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [selectedFilters, setSelectedFilters] = useState({
    status: "all",
    category: "all",
    anonymous: "all",
    city: "all",
    state: "all"
  })
  const [expandedId, setExpandedId] = useState(null)
  const [areFiltersTriggered, setAreFiltersTriggered] = useState(false)
  const [waitForPopUps, setWaitForPopUps] = useState(false)
  const router = useRouter()
  const [isResolveLoading, setIsResolveLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState({ reports: false, cities: false })
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [reportsCount, setReportsCount] = useState(0)

  const fetchReports = async (customSkip = skip) => {
    try {
      if (!user?.email && isAuthCycleOn) return

      setLoadingMore(true)
      const queryParams = new URLSearchParams({
        view: "officer-dashboard",
        status: selectedFilters.status,
        category: selectedFilters.category,
        anonymous: selectedFilters.anonymous,
        city: selectedFilters.city,
        state: selectedFilters.state,
        searchQuery: searchQuery.trim(),
        skip: customSkip.toString(),
        limit: "20"
      })

      const res = await fetch(`/api/reports?${queryParams.toString()}`)
      const data = await res.json()

      if (data.success) {
        setReportsCount(data.total)
        setReports(prev => [...prev, ...data.reports.filter(r => !prev.some(p => p._id === r._id))])
        setSkip(prev => prev + 20)
        if (reports.length + data.reports.length >= data.total) setHasMore(false)
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      console.error("Error fetching reports:", err)
      toast.error("Something went wrong!")
    } finally {
      setLoadingMore(false)
      setIsPageLoaded(true)
      setLoadingStatus(prev => ({ ...prev, reports: true }))
    }
  }

  useEffect(() => {
    setSkip(0)
    setReports([])
    setHasMore(true)
    fetchReports(0)
  }, [user])

  useEffect(() => {
    const delay = setTimeout(() => {
      setSkip(0)
      setReports([])
      setHasMore(true)
      fetchReports(0)
    }, 750)

    return () => clearTimeout(delay)
  }, [searchQuery, selectedFilters])

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight

      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight && hasMore && !loadingMore) fetchReports()
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasMore, loadingMore])

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
        setStates([{ value: "all", label: "All" }, ...tempStates])

        const tempCities = citiesData.reduce((acc, city) => {
          const state = city.state.toLowerCase()
          if (!acc[state]) acc[state] = []
          acc[state].push({ value: city.name.toLowerCase(), label: city.name })
          return acc
        }, {})

        Object.keys(tempCities).forEach(state => {
          tempCities[state].sort((a, b) => a.label.localeCompare(b.label))
        })
        setCities(tempCities)
      } catch (err) {
        console.error("Error fetching city data : ", err)
      } finally {
        setLoadingStatus(prev => ({ ...prev, cities: true }))
      }
    }
    fetchCities()
  }, [])

  useEffect(() => {
    if (loadingStatus.reports && loadingStatus.cities) setIsPageLoaded(true)
  }, [loadingStatus])

  const filterOptions = {
    status: [
      { value: "all", label: "All" },
      { value: "pending", label: "Pending" },
      { value: "resolved", label: "Resolved" }
    ],
    anonymous: [
      { value: "all", label: "All" },
      { value: "anonymous", label: "Anonymous" },
      { value: "not anonymous", label: "Not anonymous" }
    ],
    state: states,
    city: cities,
    category: [
      { value: "all", label: "All" },
      { value: "road_dump", label: "Road Dump" },
      { value: "unpicked_garbage", label: "Unpicked Waste" },
      { value: "overflowing_dustbin", label: "Overflowing Bin" },
      { value: "near_water_body", label: "Waterbody Waste" },
      { value: "dead_animal", label: "Dead Animal" },
      { value: "illegal_dumping", label: "Illegal Dump" },
      { value: "industrial_waste", label: "Industrial Waste" },
      { value: "open_dumpyard", label: "Open Yard" },
      { value: "hospital_waste", label: "Medical Waste" },
      { value: "market_waste", label: "Market Waste" },
      { value: "wastewater_leak", label: "Water Leak" }
    ]
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

  const togglePageScroll = (allowScroll) => {
    const html = document.documentElement
    const body = document.body
    if (allowScroll) {
      html.style.overflow = ""
      body.style.overflow = ""
      html.style.height = ""
      body.style.height = ""
    } else {
      html.style.overflow = "hidden"
      body.style.overflow = "hidden"
      html.style.height = "100%"
      body.style.height = "100%"
    }
  }

  const handleOverlayClick = (purpose, delay) => {
    if (purpose === "report-view") {
      setExpandedId(null)
      setTimeout(() => {
        setWaitForPopUps(false)
        togglePageScroll(true)
      }, delay)
    } else {
      setAreFiltersTriggered(false)
      setTimeout(() => {
        setWaitForPopUps(false)
        togglePageScroll(true)
      }, delay)
    }
  }

  const expandedReport = reports.find(r => r._id?.toString() === expandedId?.toString())

  return (
    <main className="p-4 flex-1">
      <h1 className="text-3xl font-[1000] font-[Public_sans] mb-4">DASHBOARD</h1>
      <section>
        <div className="flex justify-between items-center mb-2 font-[Public_sans]">
          <input type="text" className="border-2 border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-2 w-2/5 max-[300px]:w-1/3 max-[775px]:text-sm max-[500px]:text-[12px] max-[300px]:text-[10px]" placeholder="Search reports by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div className="flex items-center w-fit justify-between max-[775px]:text-sm max-[500px]:text-[12px] max-[300px]:text-[10px]">
            <button onClick={() => { if (!waitForPopUps) { setWaitForPopUps(true); setAreFiltersTriggered(true); togglePageScroll(false) } }} className="primaryBtn">Filters</button>
          </div>
        </div>
        <div className="reportsCount mb-4"><span className="font-semibold">{(searchQuery === "" && Object.values(selectedFilters).every(v => v === "all")) ? "Total Reports : " : "Matched Reports : "}</span>{reportsCount}</div>
        <div onClick={() => (expandedId && handleOverlayClick("report-view", 300) || areFiltersTriggered && handleOverlayClick("filters", 150))} className={`overlayContainer flex justify-center items-center fixed top-0 left-0 h-dvh w-dvw ${waitForPopUps ? "z-50 bg-black/50" : "-z-20 bg-transparent"} transition-all`}>
          <div onClick={(e) => e.stopPropagation()} className={`filter fixed font-[Public_sans] p-8 ${waitForPopUps && areFiltersTriggered ? "right-0" : "-right-96"} transition-all duration-300 z-[75] h-dvh w-96 bg-white`}>
            <h1 className="text-xl font-semibold mb-2">FILTERS :</h1>
            <div className="flex flex-col gap-4 w-full justify-between max-[775px]:text-sm max-[500px]:text-[12px] max-[300px]:text-[10px]">
              <div>
                <div className="pl-2 mb-1">Status :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.status.find(opt => opt.value === selectedFilters.status)} options={filterOptions.status} onChange={selected => setSelectedFilters(prev => ({ ...prev, status: selected.value }))} isSearchable={false} classNamePrefix="customSelect" placeholder="Select" />
                </ClientOnly>
              </div>
              <div>
                <div className="pl-2 mb-1">Categories :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.category.find(opt => opt.value === selectedFilters.category)} options={filterOptions.category} onChange={selected => setSelectedFilters(prev => ({ ...prev, category: selected.value }))} isSearchable={false} classNamePrefix="customSelect" placeholder="Select" />
                </ClientOnly>
              </div>
              <div>
                <div className="pl-2 mb-1">Anonymous :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.anonymous.find(opt => opt.value === selectedFilters.anonymous)} options={filterOptions.anonymous} onChange={selected => setSelectedFilters(prev => ({ ...prev, anonymous: selected.value }))} isSearchable={false} classNamePrefix="customSelect" placeholder="Select" />
                </ClientOnly>
              </div>
              <div>
                <div className="pl-2 mb-1">State :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.state.find(opt => opt.value === selectedFilters.state) || null} options={filterOptions.state} onChange={selected => setSelectedFilters(prev => ({ ...prev, state: selected.value, city: "all" }))} isSearchable={false} classNamePrefix="customSelect" placeholder="Select" />
                </ClientOnly>
              </div>
              <div>
                <div className="pl-2 mb-1">City :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.city[selectedFilters.state]?.find(opt => opt.value === selectedFilters.city) || null} options={filterOptions.city[selectedFilters.state] || []} onChange={selected => setSelectedFilters(prev => ({ ...prev, city: selected.value }))} isSearchable={false} classNamePrefix="customSelect" placeholder="Select" noOptionsMessage={() => selectedFilters?.state !== "all" ? "No cities available" : "Select a state first"} />
                </ClientOnly>
              </div>
              <div>
                <button onClick={() => setSelectedFilters({ status: "all", category: "all", anonymous: "all", city: "all", state: "all" })} className="primaryBtn">Clear All</button>
              </div>
            </div>
          </div>
          <div onClick={(e) => { if (!areFiltersTriggered) { e.stopPropagation() } }} className={`flex flex-col gap-6 ${expandedReport?.images.length !== 0 ? "h-4/5" : "h-fit"} ${waitForPopUps && expandedId ? "opacity-100 scale-100" : "opacity-0 scale-50 -z-100"} transition-all duration-300 w-3/5 bg-white rounded-xl p-8 font-[Roboto] overflow-y-auto`}>
            {expandedReport && (
              <>
                <div className="flex justify-between">
                  <div className="text-3xl font-bold">{expandedReport.title.toUpperCase()}</div>
                  <div className="font-mono h-fit bg-[var(--primary-color)]/50 px-3 py-1 rounded-md">{expandedReport.status[0].toUpperCase() + expandedReport.status.slice(1)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-mono h-fit bg-[var(--primary-color)]/50 px-3 py-1 rounded-md w-fit">{reportCategories.find(element => element.value === expandedReport.category)?.label}</div>
                  {expandedReport.status === "pending" && (
                    <div className="loadingBtnsWrappers relative w-fit group">
                      <button disabled={isResolveLoading} onClick={() => { setIsPageLoaded(false); setIsResolveLoading(true); router.push(`/resolve?reportId=${expandedReport._id}`) }} className="primaryBtn">Resolve</button>
                      {isResolveLoading && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all group-hover:scale-105 group-active:scale-100"><BtnLoader /></div>}
                    </div>
                  )}
                </div>
                <div className="text-lg"><span className="font-semibold">DESCRIPTION : </span>{expandedReport.desc}</div>
                {expandedReport.officerResponse && <div className="text-lg"><span className="font-semibold">OFFICER'S RESPONSE : </span>{expandedReport.officerResponse}</div>}
                <div className="text-lg">
                  <div><span className="font-semibold">ADDRESS :</span> {expandedReport.address}</div>
                  <div className="flex gap-2 pl-[5.8rem]">
                    <span>{expandedReport.city.split(" ").map(value => value[0].toUpperCase() + value.slice(1)).join(" ")}</span>
                    <span>|</span>
                    <span>{expandedReport.state.split(" ").map(value => value[0].toUpperCase() + value.slice(1)).join(" ")}</span>
                    <span>|</span>
                    <span>{expandedReport.pincode}</span>
                  </div>
                </div>
                <div className="text-lg font-semibold">{!expandedReport.isAnonymous ? <><span className="font-semibold">SUBMITTED BY :</span> {expandedReport.submittedBy}</> : "REPORTED ANONYMOUSLY"}</div>
                {expandedReport.resolvedBy && <div className="text-lg font-semibold"><span className="font-semibold">RESOLVED BY :</span> {expandedReport.resolvedBy}</div>}
                {expandedReport.images.length !== 0 && (
                  <div>
                    <div className="text-lg font-semibold">IMAGES :</div>
                    <div className="flex flex-wrap gap-4">
                      {expandedReport.images.map((img, i) => (
                        <CldImage key={i} src={img} alt="img" width={0} height={0} sizes="50vw" className="h-fit w-auto max-w-[45%] border border-[var(--primary-color)]/50" />
                      ))}
                    </div>
                  </div>
                )}
                {expandedReport.resolvedImages.length !== 0 && (
                  <div>
                    <div className="text-lg font-semibold">RESOLVED IMAGES :</div>
                    <div className="flex flex-wrap gap-4">
                      {expandedReport.resolvedImages.map((img, i) => (
                        <CldImage key={i} src={img} alt="img" width={0} height={0} sizes="50vw" className="h-fit w-auto max-w-[45%] border border-[var(--primary-color)]/50" />
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-lg"><span className="font-semibold">REPORTED : </span>{new Date(expandedReport.submittedAt).toLocaleDateString("en-GB")}</div>
                {expandedReport?.resolvedAt && <div className="text-lg"><span className="font-semibold">RESOLVED : </span>{new Date(expandedReport?.resolvedAt).toLocaleDateString("en-GB")}</div>}
              </>
            )}
          </div>
        </div>
        <div className="reportsContainer grid grid-cols-4 gap-4">
          {reports.length !== 0 ?
            <>
              {reports.map((report, i) => (
                <div key={i} className={`card relative group font-[Roboto] flex flex-col gap-4 transition-all ease-in-out ${report.status === "resolved" ? "bg-green-500/25 hover:bg-green-500/35" : "bg-red-500/25 hover:bg-red-500/35"} rounded-xl p-4 pb-14 hover:shadow-[4px_4px_4px_1px_#00000080] hover:-translate-1`}>
                  <div className="cardHeader flex justify-between gap-2">
                    <div className="title text-xl font-semibold line-clamp-2 overflow-hidden text-ellipsis">{report.title}</div>
                    <div className="status font-mono h-fit bg-[var(--primary-color)]/25 group-hover:bg-[var(--primary-color)]/50 transition-colors px-2 py-1 rounded-md">{report.status[0].toUpperCase() + report.status.slice(1)}</div>
                  </div>
                  <div className="desc line-clamp-3 overflow-hidden text-ellipsis">{report.desc}</div>
                  <div className="category font-mono bg-[var(--primary-color)]/25 group-hover:bg-[var(--primary-color)]/50 transition-colors px-2 py-1 rounded-md w-fit">{reportCategories.find(element => element.value === report.category)?.label}</div>
                  <div className="cardFooter absolute bottom-2 left-0 w-full px-4 flex justify-between items-center">
                    <div className="submittedAt">{new Date(report.submittedAt).toLocaleDateString("en-GB")}</div>
                    <button onClick={() => { if (!waitForPopUps) { setWaitForPopUps(true); setExpandedId(report._id); togglePageScroll(false) } }} className="primaryBtn actionBtn">Expand</button>
                  </div>
                </div>
              ))}
            </> :
            <p>No reports found</p>
          }
        </div>
        {loadingMore && (
          <div className="loaderCardsContainer flex gap-4 mt-4">
            <div style={{ height: document.querySelector(".reportsContainer")?.lastElementChild?.offsetHeight + "px" }} className="loaderCards"></div>
            <div style={{ height: document.querySelector(".reportsContainer")?.lastElementChild?.offsetHeight + "px" }} className="loaderCards"></div>
            <div style={{ height: document.querySelector(".reportsContainer")?.lastElementChild?.offsetHeight + "px" }} className="loaderCards"></div>
            <div style={{ height: document.querySelector(".reportsContainer")?.lastElementChild?.offsetHeight + "px" }} className="loaderCards"></div>
          </div>
        )}
      </section>
    </main>
  )
}

export default OfficerDashboard