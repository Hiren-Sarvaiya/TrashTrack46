"use client"
import { useAppContext } from "@/context/AppContext"
import { useEffect, useState, useMemo, useRef } from "react"
import Select from "react-select"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import ClientOnly from "./ClientOnly"
import Link from "next/link"
import reportCategories from "@/assets/data/reportCategories.json"
import citiesData from "@/assets/data/citiesData.json"
import togglePageScroll from "@/lib/togglePageScroll"
import { IoClose } from "react-icons/io5"
import { IoArrowUpOutline } from "react-icons/io5"

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
    state: "all",
    limit: "20"
  })
  const [expandedId, setExpandedId] = useState(null)
  const [areFiltersTriggered, setAreFiltersTriggered] = useState(false)
  const [waitForPopUps, setWaitForPopUps] = useState(false)
  const router = useRouter()
  const [loadingStatus, setLoadingStatus] = useState({ reports: false, cities: false })
  const [hasMore, setHasMore] = useState(true)
  const [skip, setSkip] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [reportsCount, setReportsCount] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)
  const searchInput = useRef()
  const filtersContainer = useRef()
  const [isFiltersContainerVisible, setIsFiltersContainerVisible] = useState(true)

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
        limit: selectedFilters.limit
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
      setLoadingStatus(prev => ({ ...prev, reports: true }))
    }
  }

  const fetchCities = async () => {
    try {
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

  useEffect(() => {
    setHasMounted(true)
    fetchCities()
  }, [])

  useEffect(() => {
    setSkip(0)
    setReports([])
    setHasMore(true)
    fetchReports(0)
  }, [user])

  useEffect(() => {
    if (!hasMounted) return
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
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10 && hasMore && !loadingMore) fetchReports()
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasMore, loadingMore])

  useEffect(() => {
    if (loadingStatus.reports && loadingStatus.cities) setIsPageLoaded(true)
  }, [loadingStatus])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (expandedId) handleOverlayClick("report-view", 300)
        else if (areFiltersTriggered) handleOverlayClick("filters", 150)
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [expandedId, areFiltersTriggered])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsFiltersContainerVisible(entry.isIntersecting),
      { threshold: 1.0 }
    )

    const current = filtersContainer.current
    if (current) observer.observe(current)

    return () => { if (current) observer.unobserve(current) }
  }, [])

  const filterOptions = useMemo(() => ({
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
    ],
    limit: [
      { value: "20", label: "20" },
      { value: "40", label: "40" },
      { value: "60", label: "60" },
      { value: "80", label: "80" },
      { value: "100", label: "100" }
    ]
  }), [states, cities])

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
    <main className="p-4 flex-1 w-full max-w-[1792px] mx-auto">
      <h1 className="text-3xl max-xl:text-2xl max-lg:text-xl font-[1000] font-[Public_sans] mb-2">DASHBOARD</h1>
      <section>
        <div ref={filtersContainer} className="flex max-[36rem]:flex-col max-[36rem]:items-start justify-between items-center gap-4 max-[36rem]:gap-2 max-[30rem]:text-sm mb-4 font-[Public_sans]">
          <div className="relative group w-2/5 max-[55rem]:w-3/5 max-[36rem]:w-full border-2 border-[var(--primary-color)]/25 focus-within:border-[var(--primary-color)] transition-all rounded-xl p-2">
            <input ref={searchInput} type="text" className="w-[calc(100%-36px)]" placeholder="Search reports by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <IoClose onClick={() => { setSearchQuery(""); searchInput.current.focus() }} className={`absolute ${searchQuery === "" ? "h-0 w-0" : "h-8 w-8"} top-1/2 -translate-y-1/2 right-2 text-[var(--primary-color)]/25 hover:text-[var(--primary-color)] active:text-[var(--primary-color)]/25 group-focus-within:text-[var(--primary-color)] transition-all cursor-pointer`} />
          </div>
          <div className="flex max-[36rem]:justify-between items-center max-[36rem]:w-full gap-4">
            <button onClick={() => { if (!waitForPopUps) { setWaitForPopUps(true); setAreFiltersTriggered(true); togglePageScroll(false) } }} className="primaryBtn h-fit max-[36rem]:!px-3 max-[36rem]:!py-2">Filters</button>
            <div>
              <ClientOnly>
                <Select className="w-36 text-black" value={filterOptions.limit.find((opt) => opt.value === selectedFilters.limit)} onChange={selected => setSelectedFilters(prev => ({ ...prev, limit: selected.value }))} options={filterOptions.limit} isSearchable={false} classNamePrefix="customSelect" formatOptionLabel={(e, { context }) => context === "value" ? `${e.value} of ${reportsCount}` : e.label} />
              </ClientOnly>
            </div>
          </div>
        </div>
        <div onClick={() => (expandedId && handleOverlayClick("report-view", 300) || areFiltersTriggered && handleOverlayClick("filters", 150))} className={`overlayContainer flex justify-center items-center fixed top-0 left-0 h-dvh w-dvw ${waitForPopUps ? "z-50 bg-black/50" : "-z-20 bg-transparent"} transition-all`}>
          <div onClick={(e) => e.stopPropagation()} className={`filter fixed font-[Public_sans] ${waitForPopUps && areFiltersTriggered ? "right-0" : "-right-96"} transition-all duration-300 z-[75] h-dvh w-96 max-md:w-80 max-[25rem]:w-4/5 p-8 max-md:p-6 max-[25rem]:p-4 bg-white`}>
            <h1 className="text-xl max-[25rem]:text-lg font-semibold mb-2 max-[25rem]:mb-1">FILTERS :</h1>
            <div className="flex flex-col gap-4 max-[25rem]:gap-2 w-full justify-between max-[25rem]:text-sm">
              <div>
                <div className="pl-2 mb-1">Status :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.status.find(opt => opt.value === selectedFilters.status)} options={filterOptions.status} onChange={selected => setSelectedFilters(prev => ({ ...prev, status: selected.value }))} isSearchable={false} classNamePrefix="customSelect" />
                </ClientOnly>
              </div>
              <div>
                <div className="pl-2 mb-1">Categories :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.category.find(opt => opt.value === selectedFilters.category)} options={filterOptions.category} onChange={selected => setSelectedFilters(prev => ({ ...prev, category: selected.value }))} isSearchable={false} classNamePrefix="customSelect" />
                </ClientOnly>
              </div>
              <div>
                <div className="pl-2 mb-1">Anonymous :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.anonymous.find(opt => opt.value === selectedFilters.anonymous)} options={filterOptions.anonymous} onChange={selected => setSelectedFilters(prev => ({ ...prev, anonymous: selected.value }))} isSearchable={false} classNamePrefix="customSelect" />
                </ClientOnly>
              </div>
              <div>
                <div className="pl-2 mb-1">State :</div>
                <ClientOnly>
                  <Select className="w-full text-black" value={filterOptions.state.find(opt => opt.value === selectedFilters.state) || null} options={filterOptions.state} onChange={selected => setSelectedFilters(prev => ({ ...prev, state: selected.value, city: "all" }))} isSearchable={false} classNamePrefix="customSelect" />
                </ClientOnly>
              </div>
              <div>
                <div className="pl-2 mb-1">City :</div>
                <ClientOnly>
                  <Select isDisabled={selectedFilters.state === "all"} className="w-full text-black" value={filterOptions.city[selectedFilters.state]?.find(opt => opt.value === selectedFilters.city) || null} options={filterOptions.city[selectedFilters.state] || []} onChange={selected => setSelectedFilters(prev => ({ ...prev, city: selected.value }))} isSearchable={false} classNamePrefix="customSelect" placeholder={selectedFilters.state !== "all" ? "Select" : "Select a state first"} noOptionsMessage="No cities available" />
                </ClientOnly>
              </div>
              <div>
                <button onClick={() => setSelectedFilters(prev => Object.entries(prev).every(([k, v]) => k === "limit" || v === "all") ? prev : { ...prev, status: "all", category: "all", anonymous: "all", city: "all", state: "all" })} className="primaryBtn max-[25rem]:!px-3 max-[25rem]:!py-2">Clear All</button>
              </div>
            </div>
          </div>
          <div onClick={(e) => { if (!areFiltersTriggered) { e.stopPropagation() } }} className={`flex flex-col gap-6 max-[55rem]:gap-4 min-h-1/2 max-h-4/5 max-sm:max-h-11/12 w-3/5 max-2xl:w-4/5 ${waitForPopUps && expandedId ? "opacity-100 scale-100" : "opacity-0 scale-50"} transition-all duration-300 bg-white rounded-xl p-8 max-2xl:p-6 max-lg:p-4 max-[32rem]:p-3 font-[Roboto] overflow-y-auto`}>
            {expandedReport && (
              <>
                <div className="flex max-[32rem]:flex-col justify-between gap-4 max-[32rem]:gap-1">
                  <div className="text-3xl max-[55rem]:text-2xl max-md:text-xl max-[32rem]:text-lg font-bold">{expandedReport.title.toUpperCase()}</div>
                  <div className={`font-mono max-[30rem]:text-sm text-white h-fit w-fit ${expandedReport.status === "resolved" ? "bg-[#43b581]/75" : "bg-[#d6363f]/75"} px-3 py-1 rounded-md`}>{expandedReport.status[0].toUpperCase() + expandedReport.status.slice(1)}</div>
                </div>
                <div className="flex max-[32rem]:flex-col justify-between gap-4 max-[32rem]:gap-2">
                  <div className="font-mono max-[30rem]:text-sm h-fit bg-[var(--primary-color)]/50 px-3 py-1 rounded-md w-fit">{reportCategories.find(element => element.value === expandedReport.category)?.label}</div>
                  {expandedReport.status === "pending" && (
                    <button onClick={() => { setIsPageLoaded(false); setIsResolveLoading(true); router.push(`/resolve?reportId=${expandedReport._id}`) }} className="primaryBtn max-[32rem]:!px-3 max-[32rem]:!py-1 max-[30rem]:text-sm">Resolve</button>
                  )}
                </div>
                <div className="text-justify text-lg max-[55rem]:text-base max-[30rem]:text-sm"><span className="font-semibold">DESCRIPTION : </span>{expandedReport.desc}</div>
                {expandedReport.officerResponse && <div className="text-justify text-lg max-[55rem]:text-base max-[30rem]:text-sm"><span className="font-semibold">OFFICER&apos;S RESPONSE : </span>{expandedReport.officerResponse}</div>}
                <div className="text-justify"><span className="font-semibold text-lg max-[55rem]:text-base max-[30rem]:text-sm">ADDRESS :</span> {`${expandedReport.address}, ${expandedReport.city.split(" ").map(value => value[0].toUpperCase() + value.slice(1)).join(" ")}, ${expandedReport.state.split(" ").map(value => value[0].toUpperCase() + value.slice(1)).join(" ")} - ${expandedReport.pincode}`}</div>
                <div className="text-lg max-[55rem]:text-base max-[30rem]:text-sm">{!expandedReport.isAnonymous ? <><span className="font-semibold">SUBMITTED BY :</span> {expandedReport.submittedBy}</> : "REPORTED ANONYMOUSLY"}</div>
                {expandedReport.resolvedBy && <div className="text-lg max-[55rem]:text-base max-[30rem]:text-sm"><span className="font-semibold">RESOLVED BY :</span> {expandedReport.resolvedBy}</div>}
                {expandedReport.images.length !== 0 && (
                  <div>
                    <div className="text-lg max-[55rem]:text-base max-[30rem]:text-sm font-semibold">IMAGES :</div>
                    <div className="imgLinks flex flex-wrap gap-4 max-[30rem]:gap-2 mt-1 max-[30rem]:text-sm">
                      {expandedReport.images.map((img, i) => (
                        <button key={i} className="primaryBtn actionBtn"><Link key={i} href={img} target="_blank" rel="noopener noreferrer">{`Image ${i + 1}`}</Link></button>
                      ))}
                    </div>
                  </div>
                )}
                {expandedReport.resolvedImages.length !== 0 && (
                  <div>
                    <div className="text-lg max-[55rem]:text-base max-[30rem]:text-sm font-semibold">RESOLVED IMAGES :</div>
                    <div className="imgLinks flex flex-wrap gap-4 max-[30rem]:gap-2 mt-1 max-[30rem]:text-sm">
                      {expandedReport.resolvedImages.map((img, i) => (
                        <button key={i} className="primaryBtn actionBtn"><Link key={i} href={img} target="_blank" rel="noopener noreferrer">{`Image ${i + 1}`}</Link></button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="w-full flex justify-between gap-4 max-[32rem]:gap-1 text-lg max-[55rem]:text-base max-[30rem]:text-sm max-[36rem]:text-sm max-[32rem]:flex-col">
                  <div><span className="font-semibold">REPORTED : </span>{new Date(expandedReport.submittedAt).toLocaleDateString("en-GB")}</div>
                  {expandedReport?.resolvedAt && <div><span className="font-semibold">RESOLVED : </span>{new Date(expandedReport?.resolvedAt).toLocaleDateString("en-GB")}</div>}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="reportsContainer grid grid-cols-4 max-xl:grid-cols-3 max-[55rem]:grid-cols-2 max-[36rem]:grid-cols-1 gap-4">
          {reports.length !== 0 ?
            <>
              {reports.map((report, i) => (
                <div key={i} className={`card max-[36rem]:w-11/12 max-[25rem]:w-full mx-auto relative group font-[Roboto] flex flex-col gap-4 max-lg:gap-2 transition-all ease-in-out border-2 border-black/20 rounded-xl p-4 pb-14 hover:shadow-[4px_4px_4px_1px_#00000080] hover:-translate-1`}>
                  <div className="cardHeader flex justify-between gap-2">
                    <div className="title text-xl font-semibold line-clamp-2 overflow-hidden text-ellipsis">{report.title}</div>
                    <div className={`status max-lg:text-sm max-[25rem]:text-xs max-[25rem]:mt-[3px] font-mono text-white h-fit ${report.status === "resolved" ? "bg-[#43b581]/75" : "bg-[#d6363f]/75"} transition-colors px-2 py-1 rounded-md`}>{report.status[0].toUpperCase() + report.status.slice(1)}</div>
                  </div>
                  <div className="desc text-justify max-lg:text-sm line-clamp-3 overflow-hidden text-ellipsis">{report.desc}</div>
                  <div className="category max-lg:text-sm max-[25rem]:text-xs font-mono bg-[var(--primary-color)]/25 group-hover:bg-[var(--primary-color)]/50 transition-colors px-2 py-1 rounded-md w-fit">{reportCategories.find(element => element.value === report.category)?.label}</div>
                  <div className="cardFooter max-lg:text-sm absolute bottom-2 left-0 w-full px-4 flex justify-between items-center">
                    <div className="submittedAt">{new Date(report.submittedAt).toLocaleDateString("en-GB")}</div>
                    <button onClick={() => { if (!waitForPopUps) { setWaitForPopUps(true); setExpandedId(report._id); togglePageScroll(false) } }} className="primaryBtn actionBtn">Expand</button>
                  </div>
                </div>
              ))}
            </> :
            <>{!loadingMore && <p>{(searchQuery === "" && Object.entries(selectedFilters).every(([k, v]) => k === "limit" || v === "all")) ? "No reports found!" : "No matched reports!"}</p>}</>
          }
        </div>
        {loadingMore && (
          <div className="loaderCardsContainer w-full grid grid-cols-4 max-xl:grid-cols-3 max-[55rem]:grid-cols-2 max-[36rem]:grid-cols-1 gap-4 mt-4">
            <div className="loaderCards max-[36rem]:!w-11/12 max-[25rem]:!w-full mx-auto"></div>
            <div className="loaderCards max-[36rem]:!w-11/12 max-[25rem]:!w-full mx-auto max-[36rem]:hidden"></div>
            <div className="loaderCards max-[36rem]:!w-11/12 max-[25rem]:!w-full mx-auto max-[55rem]:hidden"></div>
            <div className="loaderCards max-[36rem]:!w-11/12 max-[25rem]:!w-full mx-auto max-xl:hidden"></div>
          </div>
        )}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-8 max-[30rem]:bottom-4 ${isFiltersContainerVisible ? "-right-14" : "right-8 max-[30rem]:right-4"} bg-white p-2 rounded-full border-2 border-[var(--primary-color)] cursor-pointer z-49`}
          style={{ transition: "right 300ms ease, transform 150ms ease", willChange: "transform" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1.05)"}
        >
          <IoArrowUpOutline size={32} className="text-[var(--primary-color)]" />
        </div>
      </section>
    </main>
  )
}

export default OfficerDashboard