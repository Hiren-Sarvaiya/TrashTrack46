"use client"
import { useAppContext } from "@/context/AppContext"
import { useState, useEffect, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import insightsDataCollector from "@/lib/insightsDataCollector"
import { toast } from "react-toastify"

const Insights = () => {
  const { setIsPageLoaded, user, isAuthCycleOn } = useAppContext()
  const [reports, setReports] = useState([])
  const [insightsData, setInsightsData] = useState([])
  const [chartsStyles, setChartsStyles] = useState({})
  const [dataRenders, setDataRenders] = useState({
    lineChart: false,
    barChart: false,
    pie1: false,
    pie2: false,
    cards: false
  })
  const lineChartRef = useRef(null)
  const barChartRef = useRef(null)
  const pie1Ref = useRef(null)
  const pie2Ref = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!user?.email && isAuthCycleOn) return
        await fetch("/api/reports?view=insights")
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              if (data.reports.length !== 0) setReports(data.reports)
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

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        setInsightsData(await insightsDataCollector(reports))
      } catch (err) {
        console.error("Error fetching insights data : ", err)
        toast.error("Something went wrong!")
      }
    }
    if (reports) fetchInsightsData()
  }, [reports])

  useEffect(() => {
    const interval = setInterval(() => {
      const newRenders = { ...dataRenders }

      if (!newRenders.lineChart && lineChartRef.current) {
        const texts = lineChartRef.current.querySelectorAll("text")
        newRenders.lineChart = [...texts].some(el => el.textContent?.trim())
      }

      if (!newRenders.barChart && barChartRef.current) {
        const texts = barChartRef.current.querySelectorAll("text")
        newRenders.barChart = [...texts].some(el => el.textContent?.trim())
      }

      if (!newRenders.pie1 && pie1Ref.current) {
        const texts = pie1Ref.current.querySelectorAll("text")
        newRenders.pie1 = [...texts].some(el => el.textContent?.includes("%"))
      }

      if (!newRenders.pie2 && pie2Ref.current) {
        const texts = pie2Ref.current.querySelectorAll("text")
        newRenders.pie2 = [...texts].some(el => el.textContent?.includes("%"))
      }

      if (!newRenders.cards && cardsRef.current) {
        const h1s = cardsRef.current.querySelectorAll("h1")
        newRenders.cards = [...h1s].every(el => el.textContent?.trim())
      }

      const allDone = Object.values(newRenders).every(Boolean)
      if (allDone) {
        clearInterval(interval)
        setIsPageLoaded(true)
      }

      if (JSON.stringify(newRenders) !== JSON.stringify(dataRenders)) setDataRenders(newRenders)
    }, 250)

    return () => clearInterval(interval)
  }, [dataRenders])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF69B4", "#7ED957", "#FFA07A", "#20B2AA", "#BA55D3", "#D2691E"]

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    if (percent === 1) return <text x={cx} y={cy} className="pointer-events-none" fill="white" textAnchor="middle" dominantBaseline="central">100%</text>
    return <text x={x} y={y} className="pointer-events-none" fill="white" textAnchor="middle" dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>
  }

  useEffect(() => {
    const updateChartsStyles = () => {
      switch (true) {
        case window.innerWidth < 480:
          setChartsStyles(prev => ({ ...prev, margin: { top: 10, right: 10, left: 0, bottom: 0 }, paddingX: { left: 22, right: 22 }, paddingY: { top: 22, bottom: 22 }, angle: -90 }))
          break
        case window.innerWidth < 640:
          setChartsStyles(prev => ({ ...prev, margin: { top: 15, right: 15, left: 5, bottom: 5 }, paddingX: { left: 28, right: 28 }, paddingY: { top: 28, bottom: 28 }, yAxisWidth: 32 }))
          break
        case window.innerWidth < 1024:
          setChartsStyles(prev => ({ ...prev, margin: { top: 25, right: 25, left: 10, bottom: 10 }, paddingX: { left: 32, right: 32 }, paddingY: { top: 32, bottom: 32 } }))
          break
        case window.innerWidth < 1280:
          setChartsStyles(prev => ({ ...prev, margin: { top: 15, right: 15, left: 5, bottom: 5 }, paddingX: { left: 28, right: 28 }, paddingY: { top: 28, bottom: 28 } }))
          break
        default:
          setChartsStyles(prev => ({ ...prev, margin: { top: 25, right: 25, left: 10, bottom: 10 }, paddingX: { left: 32, right: 32 }, paddingY: { top: 32, bottom: 32 }, contentStyle: { backgroundColor: "#fff", borderRadius: 8, border: "1px solid #d3935c" }, labelStyle: { color: "#d3935c" }, color: "#00000080", outerRadius: "100%", yAxisWidth: 32, angle: 0 }))
      }
    }

    updateChartsStyles()
    window.addEventListener("resize", updateChartsStyles)
    return () => window.removeEventListener("resize", updateChartsStyles)
  }, [])

  return (
    <main className="p-4 flex-1 w-full max-w-[1792px] mx-auto">
      <h1 className="text-3xl max-xl:text-2xl font-[1000] font-[Public_sans] mb-4 max-lg:mb-2">INSIGHTS</h1>
      <section className="flex max-lg:flex-col gap-4 max-lg:gap-2">
        <div className="w-[calc(50%-8px)] max-lg:w-full mb-4 max-lg:mb-0">
          <div className="h-[448px] max-lg:h-96 w-full p-3 pl-4 border-2 border-[var(--primary-color-50)] rounded-xl max-md:rounded-lg flex flex-col">
            <h2 className="text-2xl max-xl:text-xl font-semibold">Report Submissions</h2>
            <p className="text-black/60">Grouped in 4-day intervals for this month.</p>
            <div className="flex-grow" ref={lineChartRef}>
              <ResponsiveContainer className="select-none max-sm:text-sm max-[30rem]:text-xs">
                <LineChart data={insightsData?.reportsSubmissionData} margin={chartsStyles.margin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis height={chartsStyles.angle === -90 ? 48 : 24} angle={chartsStyles.angle} textAnchor={chartsStyles.angle === -90 ? "end" : "middle"} dataKey="Dates" stroke={chartsStyles.color} padding={chartsStyles.paddingX} />
                  <YAxis width={chartsStyles.angle === -90 ? 24 : 32} stroke={chartsStyles.color} padding={chartsStyles.paddingY} />
                  <Tooltip contentStyle={chartsStyles.contentStyle} labelStyle={chartsStyles.labelStyle} itemStyle={{ color: chartsStyles.color }} />
                  <Legend />
                  <Line type="natural" dataKey="Reports" stroke="#d3935c" strokeWidth={2} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="font-[Roboto] mb-4 max-lg:mb-2">
          <div className="grid grid-cols-2 max-lg:grid-cols-4 max-[58rem]:grid-cols-3 max-md:grid-cols-2 max-[30rem]:grid-cols-1 gap-4 max-lg:gap-2 w-full" ref={cardsRef}>
            {insightsData?.cardsData?.map((card, i) => (
              <div key={i} className="stats p-3 pr-16 max-xl:pr-10 w-full max-[30rem]:w-2/3 max-[25rem]:w-3/4 border-2 border-[var(--primary-color-50)] rounded-xl max-md:rounded-lg">
                <h3 className="text-lg max-xl:text-base max-lg:text-sm max-[30rem]:text-base text-black/60 mb-1 max-xl:mb-[2px] max-lg:mb-0">{card.line1}</h3>
                <h1 className="text-4xl max-xl:text-3xl font-bold">{card.value?.toString()}</h1>
                <div className={`${(card.line2?.includes("+") && card.line2?.endsWith("days since last month")) ? "text-red-400" : "text-green-400"} ${(card.line1.includes("Pending") && insightsData.cardsData[3].line2.match(/\d+/)?.[0] > insightsData.cardsData[2].line2.match(/\d+/)?.[0]) && "text-red-400!"} text-sm max-lg:text-xs max-[30rem]:text-sm mb-3`}>{card.line2}</div>
                <p className="text-black/60 max-lg:text-sm max-[30rem]:text-base text-nowrap">{card.line3}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex max-lg:flex-col gap-4 max-lg:gap-2">
        <div className="h-[448px] w-1/2 max-lg:w-full p-3 pl-4 border-2 border-[var(--primary-color-50)] rounded-xl max-md:rounded-lg flex flex-col">
          <h2 className="text-2xl max-xl:text-xl font-semibold">Report Categories</h2>
          <p className="text-black/60">Breakdown of Reports by category.</p>
          <ResponsiveContainer className="select-none max-sm:text-sm" ref={barChartRef}>
            <BarChart data={insightsData?.reportCategoriesData} layout="vertical" margin={chartsStyles.margin}>
              <CartesianGrid strokeDasharray="3 3" horizontal vertical />
              <XAxis type="number" stroke={"chartsStyles.color"} />
              <YAxis dataKey="label" type="category" stroke={chartsStyles.color} width={0} interval={0} />
              <Tooltip contentStyle={chartsStyles.contentStyle} labelStyle={chartsStyles.labelStyle} itemStyle={{ color: chartsStyles.color }} />
              <Legend payload={[{ value: "Reports", type: "square", color: COLORS[0] }]} />
              <Bar dataKey="Reports" fill="#d3935c" label={({ x, y, width, height, index }) => (<text x={x + 10} y={y + height / 2} fill="#fff" fontSize={12} dominantBaseline="middle">{insightsData?.reportCategoriesData?.[index]?.label}</text>)}>
                {insightsData?.reportCategoriesData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 max-lg:w-full flex max-sm:flex-col gap-4 max-lg:gap-2">
          {[{ title: "Report Status", data: insightsData?.reportStatusData || [] }, { title: "Citizen Types", data: insightsData?.citizenTypesData || [] }].map((chart, i) => (
            <div key={i} className="h-full max-lg:h-80 w-1/2 max-sm:w-full p-3 pl-4 border-2 border-[var(--primary-color-50)] rounded-xl max-md:rounded-lg flex flex-col" ref={i === 1 ? pie1Ref : pie2Ref}>
              <h2 className="text-2xl max-xl:text-xl font-semibold">{chart.title}</h2>
              <p className="text-black/60">{i === 0 ? "Current distribution of report statuses." : (i === 1 ? "Breakdown of reports by status type." : "Distribution of reports by anonymity.")}</p>
              <div className="flex-grow">
                <ResponsiveContainer className="select-none max-sm:text-sm">
                  <PieChart margin={chartsStyles.margin}>
                    <Legend iconType="circle" />
                    <Tooltip contentStyle={chartsStyles.contentStyle} itemStyle={{ color: chartsStyles.color }} formatter={(v) => (v === 0 ? null : v)} labelFormatter={(l) => (l === 0 ? "" : l)} />
                    <Pie data={chart.data} cx="50%" cy="50%" outerRadius={chartsStyles.outerRadius} fill="#d3935c" nameKey="label" dataKey="value" stroke={chart.data.length === 1 ? "none" : "#fff"} labelLine={false} label={renderCustomizedLabel} activeShape={{ stroke: "none" }} activeIndex={-1}>
                      {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Insights