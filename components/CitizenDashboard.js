"use client"
import { useAppContext } from "@/context/AppContext"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import Select from "react-select"
import { BsPlusLg } from "react-icons/bs"
import { toast } from "react-toastify"
import { CldImage } from "next-cloudinary"
import { MdDelete } from "react-icons/md"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import ClientOnly from "./ClientOnly"

const CitizenDashboard = () => {
  const { user, setIsPageLoaded, isAuthCycleOn } = useAppContext()
  const [reports, setReports] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isAddHovered, setIsAddHovered] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [innerDeletingId, setInnerDeletingId] = useState(null)
  const [outerDeletingId, setOuterDeletingId] = useState(null)
  const [waitForPopUps, setWaitForPopUps] = useState(false)
  const MySwal = withReactContent(Swal)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!user?.email && isAuthCycleOn) return
        await fetch(`/api/report?submittedBy=${user.email}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              if (data.reports.length !== 0) setReports(data.reports)
              else setIsPageLoaded(true)
            } else {
              toast.error(data.message)
            }
          })
      } catch (err) {
        console.error("Error fetching reports : ", err)
        toast.error("Something went wrong!")
      }
    }
    fetchReports()
  }, [user])

  const filteredReports = useMemo(() => {
    if (reports.length === 0) return []

    return reports.filter(report => {
      const matchesStatus = selectedFilter === "all" || report.status === selectedFilter
      const searchWords = searchQuery.trim().toLowerCase().split(/\s+/)
      const titleWords = report.title.toLowerCase().split(/\s+/)
      const matchesSearch = searchWords.some(qw => titleWords.some(tw => tw.includes(qw)))
      return matchesStatus && matchesSearch
    })
  }, [reports, selectedFilter, searchQuery])

  useEffect(() => {
    if (filteredReports.length !== 0) setIsPageLoaded(true)
  }, [filteredReports])

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "resolved", label: "Resolved" }
  ]

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

  const handleDeleteReport = async (id) => {
    const result = await MySwal.fire({
      title: "DELETE REPORT",
      text: "Are you sure you want to delete this report? You can't undo this.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
    })

    if (!result.isConfirmed) {
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
      console.log("Error deleting report : ", err)
      toast.error("Error deleting report!")
    } finally {
      setOuterDeletingId(null)
    }
  }

  const handleOverlayClick = () => {
    setExpandedId(null)
    setTimeout(() => {
      setWaitForPopUps(false)
    }, 300)
  }

  const expandedReport = reports.find(r => r._id?.toString() === expandedId?.toString())

  return (
    <main className="p-4">
      <h1 className="text-3xl font-[1000] font-[Public_sans] mb-4">MY REPORTS</h1>
      <section>
        <div className="flex justify-between items-center mb-4">
          <input type="text" className="border-2 border-[var(--primary-color)]/25 focus:border-[var(--primary-color)] transition-all rounded-xl p-2 w-2/5 max-[300px]:w-1/3 max-[775px]:text-sm max-[500px]:text-[12px] max-[300px]:text-[10px]" placeholder="Search reports by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div className="flex items-center w-fit justify-between max-[775px]:text-sm max-[500px]:text-[12px] max-[300px]:text-[10px]">
            <ClientOnly>
              <Select className="w-[8rem] max-[775px]:w-[7.25rem] max-[500px]:w-[6.25rem] text-black" value={filterOptions.find((opt) => opt.value === selectedFilter)} onChange={(selected) => setSelectedFilter(selected.value)} options={filterOptions} isSearchable={false} classNamePrefix="customSelect" placeholder="Select" />
            </ClientOnly>
          </div>
        </div>
        <div onClick={handleOverlayClick} className={`overlayContainer flex justify-center items-center fixed top-0 left-0 h-dvh w-dvw ${waitForPopUps ? "z-50 bg-black/50" : "-z-20 bg-transparent"} transition-all`}>
          <div onClick={(e) => e.stopPropagation()} className={`flex flex-col gap-6 ${expandedReport?.images.length !== 0 ? "h-4/5" : "h-fit"} ${waitForPopUps && expandedId ? "opacity-100 scale-100" : "opacity-0 scale-50"} transition-all duration-300 w-3/5 bg-white rounded-xl p-8 font-[Roboto] overflow-y-auto`}>
            {expandedId?.toString() && (
              <>
                <div className="flex justify-between">
                  <div className="text-3xl font-bold">{expandedReport.title.toUpperCase()}</div>
                  <div className="font-mono h-fit bg-[var(--primary-color)]/50 px-3 py-1 rounded-md">{expandedReport.status[0].toUpperCase() + expandedReport.status.slice(1)}</div>
                </div>
                <div className="font-mono h-fit bg-[var(--primary-color)]/50 px-3 py-1 rounded-md w-fit">{reportCategories.find(element => element.value === expandedReport.category)?.label}</div>
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
          {filteredReports.length !== 0 ?
            <>
              {filteredReports.map((report, i) => (
                <div key={i} className={`card relative group font-[Roboto] flex flex-col gap-4 transition-all ease-in-out ${outerDeletingId === report._id ? "!bg-gray-900/25 !cursor-not-allowed !select-none" : ""} ${innerDeletingId === report._id ? "opacity-0 scale-95" : "opacity-100 scale-100"} ${innerDeletingId === report._id ? "duration-500" : "duration-150"} ${report.status === "resolved" ? "bg-green-500/25 hover:bg-green-500/35" : "bg-red-500/25 hover:bg-red-500/35"} rounded-xl p-4 pb-14 hover:shadow-[4px_4px_4px_1px_#00000080] hover:-translate-1`}>
                  <div className="cardHeader flex justify-between">
                    <div className="title text-xl font-semibold line-clamp-2 overflow-hidden text-ellipsis">{report.title}</div>
                    <div className="status font-mono h-fit bg-[var(--primary-color)]/25 group-hover:bg-[var(--primary-color)]/50 transition-colors px-2 py-1 rounded-md">{report.status[0].toUpperCase() + report.status.slice(1)}</div>
                  </div>
                  <div className="desc line-clamp-3 overflow-hidden text-ellipsis">{report.desc}</div>
                  <div className="category font-mono bg-[var(--primary-color)]/25 group-hover:bg-[var(--primary-color)]/50 transition-colors px-2 py-1 rounded-md w-fit">{reportCategories.find(element => element.value === report.category)?.label}</div>
                  <div className="cardFooter absolute bottom-2 left-0 w-full px-4 flex justify-between items-center">
                    <div className="submittedAt">{new Date(report.submittedAt).toLocaleDateString("en-GB")}</div>
                    {report.status === "pending" && <MdDelete onClick={() => handleDeleteReport(report._id.toString())} size="2rem" className="text-[var(--primary-color)]/75 hover:text-[var(--primary-color)] cursor-pointer" />}
                    <button onClick={() => { setWaitForPopUps(true); setExpandedId(report._id) }} className="primaryBtn actionBtn">Expand</button>
                  </div>
                </div>
              ))}
            </> :
            <p>No reports found</p>
          }
        </div>
      </section>
      <Link onClick={() => setIsPageLoaded(false)} href="/report" onMouseEnter={() => setIsAddHovered(false)} onMouseLeave={() => setIsAddHovered(true)} className="addReportContainer z-49 group flex gap-2 items-center transition-all border-2 border-[var(--primary-color)] bg-white w-fit rounded-full pl-2 py-2 fixed bottom-8 right-8 cursor-pointer hover:pr-6 active:scale-95">
        <BsPlusLg size={32} className={`text-[var(--primary-color)] ${isAddHovered ? "rotate-0 duration-500" : "-rotate-90 duration-300"} transition-transform ease-in-out group-active:opacity-75`} />
        <div className="text-[var(--primary-color)] group-active:opacity-75 text-xl font-semibold overflow-hidden max-w-0 group-hover:max-w-[120px] group-hover:ml-1 transition-all duration-500 whitespace-nowrap">Add report</div>
      </Link>
    </main>
  )
}

export default CitizenDashboard