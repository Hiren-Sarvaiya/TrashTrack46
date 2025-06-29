"use client"
import { useAppContext } from "@/context/AppContext"
import Link from "next/link"
import { useEffect, useState, useMemo, useRef } from "react"
import Select from "react-select"
import { BsPlusLg } from "react-icons/bs"
import { toast } from "react-toastify"
import { MdDeleteForever } from "react-icons/md"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import ClientOnly from "./ClientOnly"
import reportCategories from "@/assets/data/reportCategories.json"
import togglePageScroll from "@/lib/togglePageScroll"
import { IoClose } from "react-icons/io5"
import { IoArrowUpOutline } from "react-icons/io5"

const CitizenDashboard = () => {
  const { user, setIsPageLoaded, isAuthCycleOn } = useAppContext()
  const [reports, setReports] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    status: "all",
    limit: "20"
  })
  const [isAddHovered, setIsAddHovered] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [innerDeletingId, setInnerDeletingId] = useState(null)
  const [outerDeletingId, setOuterDeletingId] = useState(null)
  const [waitForPopUps, setWaitForPopUps] = useState(false)
  const MySwal = withReactContent(Swal)
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
        view: "citizen-dashboard",
        submittedBy: user.email,
        status: selectedFilters.status,
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
      setIsPageLoaded(true)
    }
  }

  useEffect(() => { setHasMounted(true) }, [])

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
    const handleEsc = (e) => {
      if (e.key === "Escape") handleOverlayClick()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [expandedId])

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
    limit: [
      { value: "20", label: "20" },
      { value: "40", label: "40" },
      { value: "60", label: "60" },
      { value: "80", label: "80" },
      { value: "100", label: "100" }
    ]
  }), [])

  const handleDeleteReport = async (id) => {
    const confirmation = await MySwal.fire({
      title: "DELETE REPORT",
      text: "Are you sure you want to permanently delete this report?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      customClass: {
        confirmButton: "primaryBtn !px-6 hover:!bg-[var(--primary-color)] active:!bg-[var(--primary-color)] focus:!bg-[var(--primary-color)] focus:!outline-none focus:!ring-2 focus:!ring-[var(--primary-color)]/50",
        cancelButton: "primaryBtn !px-6 !bg-transparent !border-2 !border-[var(--primary-color)] !text-[var(--primary-color)] focus:!outline-none focus:!ring-2 focus:!ring-[var(--primary-color)]/50"
      }
    })

    if (!confirmation.isConfirmed) {
      setOuterDeletingId(null)
      return
    }
    try {
      setOuterDeletingId(id)
      await fetch(`/api/report?reportId=${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setInnerDeletingId(id)
            setTimeout(() => {
              setReports(prev => prev.filter(r => r._id !== id))
              setInnerDeletingId(null)
            }, 500)
          } else {
            data?.error && console.error(data.error)
            toast.error(data.message)
          }
        })
    } catch (err) {
      console.error("Error deleting report : ", err)
      toast.error("Error deleting report!")
    } finally {
      setOuterDeletingId(null)
    }
  }

  const handleOverlayClick = () => {
    setExpandedId(null)
    setTimeout(() => {
      setWaitForPopUps(false)
      togglePageScroll(true)
    }, 300)
  }

  const expandedReport = reports.find(r => r._id?.toString() === expandedId?.toString())

  return (
    <main className="p-4 flex-1 w-full max-w-[1792px] mx-auto">
      <h1 className="text-3xl max-xl:text-2xl max-lg:text-xl font-[1000] font-[Public_sans] mb-2">MY REPORTS</h1>
      <section>
        <div ref={filtersContainer} className="flex max-[36rem]:flex-col max-[36rem]:items-start justify-between items-center gap-4 max-[36rem]:gap-2 max-[30rem]:text-sm mb-4">
          <div className="relative group w-2/5 max-[55rem]:w-3/5 max-[36rem]:w-full border-2 border-[var(--primary-color)]/25 focus-within:border-[var(--primary-color)] transition-all rounded-xl p-2">
            <input ref={searchInput} type="text" className="w-[calc(100%-36px)]" placeholder="Search reports by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <IoClose onClick={() => { setSearchQuery(""); searchInput.current.focus() }} className={`absolute ${searchQuery === "" ? "h-0 w-0" : "h-8 w-8"} top-1/2 -translate-y-1/2 right-2 text-[var(--primary-color)]/25 hover:text-[var(--primary-color)] active:text-[var(--primary-color)]/25 group-focus-within:text-[var(--primary-color)] transition-all cursor-pointer`} />
          </div>
          <div className="flex max-[36rem]:justify-between max-[36rem]:w-full gap-4">
            <div>
              <ClientOnly>
                <Select className="w-32 text-black" value={filterOptions.status.find((opt) => opt.value === selectedFilters.status)} onChange={selected => setSelectedFilters(prev => ({ ...prev, status: selected.value }))} options={filterOptions.status} isSearchable={false} classNamePrefix="customSelect" />
              </ClientOnly>
            </div>
            <div>
              <ClientOnly>
                <Select className="w-36 text-black" value={filterOptions.limit.find((opt) => opt.value === selectedFilters.limit)} onChange={selected => setSelectedFilters(prev => ({ ...prev, limit: selected.value }))} options={filterOptions.limit} isSearchable={false} classNamePrefix="customSelect" formatOptionLabel={(e, { context }) => context === "value" ? `${e.value} of ${reportsCount}` : e.label} />
              </ClientOnly>
            </div>
          </div>
        </div>
        <div onClick={handleOverlayClick} className={`overlayContainer flex justify-center items-center fixed top-0 left-0 h-dvh w-dvw ${waitForPopUps ? "z-50 bg-black/50" : "-z-20 bg-transparent"} transition-all`}>
          <div onClick={(e) => e.stopPropagation()} className={`flex flex-col gap-6 max-[55rem]:gap-4 min-h-1/2 max-h-4/5 max-sm:max-h-11/12 w-3/5 max-2xl:w-4/5 ${waitForPopUps && expandedId ? "opacity-100 scale-100" : "opacity-0 scale-50"} transition-all duration-300 bg-white rounded-xl p-8 max-2xl:p-6 max-lg:p-4 max-[32rem]:p-3 font-[Roboto] overflow-y-auto`}>
            {expandedId?.toString() && (
              <>
                <div className="flex max-[32rem]:flex-col justify-between gap-4 max-[32rem]:gap-1">
                  <div className="text-3xl max-[55rem]:text-2xl max-md:text-xl max-[32rem]:text-lg font-bold">{expandedReport.title.toUpperCase()}</div>
                  <div className={`font-mono max-[30rem]:text-sm text-white h-fit w-fit ${expandedReport.status === "resolved" ? "bg-[#43b581]/75" : "bg-[#d6363f]/75"} px-3 py-1 rounded-md`}>{expandedReport.status[0].toUpperCase() + expandedReport.status.slice(1)}</div>
                </div>
                <div className="font-mono max-[30rem]:text-sm h-fit bg-[var(--primary-color)]/50 px-3 py-1 rounded-md w-fit">{reportCategories.find(element => element.value === expandedReport.category)?.label}</div>
                <div className="text-justify text-lg max-[55rem]:text-base max-[30rem]:text-sm"><span className="font-semibold">DESCRIPTION : </span>{expandedReport.desc}</div>
                {expandedReport.officerResponse && <div className="text-justify text-lg max-[55rem]:text-base max-[30rem]:text-sm"><span className="font-semibold">OFFICER&apos;S RESPONSE : </span>{expandedReport.officerResponse}</div>}
                <div className="text-justify"><span className="font-semibold text-lg max-[55rem]:text-base max-[30rem]:text-sm">ADDRESS :</span> {`${expandedReport.address}, ${expandedReport.city.split(" ").map(value => value[0].toUpperCase() + value.slice(1)).join(" ")}, ${expandedReport.state.split(" ").map(value => value[0].toUpperCase() + value.slice(1)).join(" ")} - ${expandedReport.pincode}`}</div>
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
                <div key={i} className={`card max-[36rem]:w-11/12 max-[25rem]:w-full mx-auto relative group font-[Roboto] flex flex-col gap-4 max-lg:gap-2 transition-all ease-in-out ${outerDeletingId === report._id ? "!bg-gray-900/25 !cursor-not-allowed !select-none" : ""} ${innerDeletingId === report._id ? "opacity-0 scale-95 duration-500" : "opacity-100 scale-100 duration-150"} border-2 border-black/20 rounded-xl p-4 pb-14 hover:shadow-[4px_4px_4px_1px_#00000080] hover:-translate-1`}>
                  <div className="cardHeader flex justify-between gap-2">
                    <div className="title text-xl max-lg:text-lg font-semibold line-clamp-2 overflow-hidden text-ellipsis">{report.title}</div>
                    <div className={`status max-lg:text-sm max-[25rem]:text-xs max-[25rem]:mt-[3px] font-mono text-white h-fit ${report.status === "resolved" ? "bg-[#43b581]/75" : "bg-[#d6363f]/75"} transition-colors px-2 py-1 rounded-md`}>{report.status[0].toUpperCase() + report.status.slice(1)}</div>
                  </div>
                  <div className="desc text-justify max-lg:text-sm line-clamp-3 overflow-hidden text-ellipsis">{report.desc}</div>
                  <div className="category max-lg:text-sm max-[25rem]:text-xs font-mono bg-[var(--primary-color)]/25 group-hover:bg-[var(--primary-color)]/50 transition-colors px-2 py-1 rounded-md w-fit">{reportCategories.find(element => element.value === report.category)?.label}</div>
                  <div className="cardFooter max-lg:text-sm absolute bottom-2 left-0 w-full px-4 flex justify-between items-center">
                    <div className="submittedAt">{new Date(report.submittedAt).toLocaleDateString("en-GB")}</div>
                    {report.status === "pending" && <MdDeleteForever onClick={() => handleDeleteReport(report._id.toString())} className={`h-8 w-8 text-[var(--primary-color)]/75 hover:text-[var(--primary-color)] cursor-pointer ${outerDeletingId === report._id ? "pointer-events-none text-black/25" : ""}`} />}
                    <button disabled={outerDeletingId === report._id} onClick={() => { setWaitForPopUps(true); setExpandedId(report._id); togglePageScroll(false) }} className="primaryBtn actionBtn disabled:!text-black/50">Expand</button>
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
      </section>
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 max-[30rem]:bottom-4 ${isFiltersContainerVisible ? "-left-14" : "left-8 max-[30rem]:left-4"} bg-white p-2 rounded-full border-2 border-[var(--primary-color)] cursor-pointer z-49`}
        style={{ transition: "left 300ms ease, transform 150ms ease", willChange: "transform" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1.05)"}
      >
        <IoArrowUpOutline size={32} className="text-[var(--primary-color)]" />
      </div>
      <Link onClick={() => setIsPageLoaded(false)} href="/report" onMouseEnter={() => setIsAddHovered(false)} onMouseLeave={() => setIsAddHovered(true)} className="addReportContainer z-49 group flex gap-2 items-center transition-all border-2 border-[var(--primary-color)] bg-white w-fit rounded-full pl-2 py-2 fixed bottom-8 right-8 max-[30rem]:bottom-4 max-[30rem]:right-4 cursor-pointer hover:pr-6 active:scale-95">
        <BsPlusLg size={32} className={`text-[var(--primary-color)] ${isAddHovered ? "rotate-0 duration-500" : "-rotate-90 duration-300"} transition-transform ease-in-out group-active:opacity-75`} />
        <div className="text-[var(--primary-color)] group-active:opacity-75 text-xl font-semibold overflow-hidden max-w-0 group-hover:max-w-[120px] group-hover:ml-1 transition-all duration-500 whitespace-nowrap">Add report</div>
      </Link>
    </main>
  )
}

export default CitizenDashboard