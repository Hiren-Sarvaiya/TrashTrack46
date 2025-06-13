"use client"
import { useAppContext } from "@/context/AppContext"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import insightsDataCollector from "@/lib/insightsDataCollector"
import { toast } from "react-toastify"

const Insights = () => {
  const { setIsPageLoaded, user, isAuthCycleOn } = useAppContext()
  const [reports, setReports] = useState([])
  const [insightsData, setInsightsData] = useState([])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!user?.email && isAuthCycleOn) return
        await fetch("/api/reports?purpose=insights")
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
      } finally {
        console.log(reports.filter(report => { return report.longitude === null }).length)
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
      } finally {
        setIsPageLoaded(true)
      }
    }
    if (reports) fetchInsightsData()
  }, [reports])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF69B4", "#7ED957", "#FFA07A", "#20B2AA", "#BA55D3", "#D2691E"]

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    if (percent === 1) return <text x={cx} y={cy} className="pointer-events-none" fill="white" textAnchor="middle" dominantBaseline="central">100%</text>
    return <text x={x} y={y} className="pointer-events-none" fill="white" textAnchor="middle" dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>
  }

  return (
    <main className="p-4">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-[1000] font-[Public_sans] mb-4">INSIGHTS</h1>
        <section className="flex gap-4">
          <div className="w-1/2 flex gap-4 mb-4">
            <div className="h-[448px] w-full p-3 pl-4 border-2 border-[var(--primary-color-50)] rounded-xl flex flex-col">
              <h2 className="text-2xl font-semibold">Report Submissions</h2>
              <p className="text-black/60">Grouped in 4-day intervals for this month.</p>
              <div className="flex-grow">
                <ResponsiveContainer className="select-none">
                  <LineChart data={insightsData?.reportsSubmissionData} margin={{ top: 25, right: 25, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="Dates" stroke="#00000080" padding={{ left: 32, right: 32 }} />
                    <YAxis width={32} stroke="#00000080" padding={{ top: 32, bottom: 32 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #d3935c" }} labelStyle={{ color: "#d3935c" }} itemStyle={{ color: "#00000080" }} />
                    <Legend />
                    <Line type="natural" dataKey="Reports" stroke="#d3935c" strokeWidth={2} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="w-1/2 font-[Roboto] mb-4 flex gap-4">
            <div className="flex flex-wrap gap-4 h-fit w-full">
              {insightsData?.cardsData?.map((card, i) => (
                <div key={i} className="stats p-3 pr-16 h-fit w-fit border-2 border-[var(--primary-color-50)] rounded-xl">
                  <h3 className="text-lg text-black/60 mb-1">{card.line1}</h3>
                  <h1 className="text-4xl font-bold">{card.value?.toString()}</h1>
                  <div className={`${(card.line2?.includes("+") && card.line2?.endsWith("days since last month")) ? "text-red-400" : "text-green-400"} ${(card.line1.includes("Pending") && insightsData.cardsData[3].line2.match(/\d+/)?.[0] > insightsData.cardsData[2].line2.match(/\d+/)?.[0]) && "text-red-400!"} text-sm mb-3`}>{card.line2}</div>
                  <p className="text-black/60 text-nowrap">{card.line3}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="flex gap-4 mb-4">
          <div className="h-[448px] w-1/2 p-3 pl-4 border-2 border-[var(--primary-color-50)] rounded-xl flex flex-col">
            <h2 className="text-2xl font-semibold">Report Categories</h2>
            <p className="text-black/60">Breakdown of Reports by category.</p>
            <ResponsiveContainer className="select-none">
              <BarChart data={insightsData?.reportCategoriesData} layout="vertical" margin={{ top: 25, right: 25, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical />
                <XAxis type="number" stroke="#00000080" />
                <YAxis dataKey="label" type="category" stroke="#00000080" width={0} interval={0} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #d3935c" }} labelStyle={{ color: "#d3935c" }} itemStyle={{ color: "#00000080" }} />
                <Legend payload={[{ value: "Reports", type: "square", color: COLORS[0] }]} />
                <Bar dataKey="Reports" fill="#d3935c" label={({ x, y, width, height, index }) => (<text x={x + 10} y={y + height / 2} fill="#fff" fontSize={12} dominantBaseline="middle">{insightsData?.reportCategoriesData?.[index]?.label}</text>)}>
                  {insightsData?.reportCategoriesData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 flex gap-4">
            {[{ title: "Report Status", data: insightsData?.reportStatusData || [] }, { title: "Citizen Types", data: insightsData?.citizenTypesData || [] }].map((chart, i) => (
              <div key={i} className="h-full w-1/2 p-3 pl-4 border-2 border-[var(--primary-color-50)] rounded-xl flex flex-col">
                <h2 className="text-2xl font-semibold">{chart.title}</h2>
                <p className="text-black/60">{i === 0 ? "Current distribution of report statuses." : (i === 1 ? "Breakdown of Reports by category." : "Distribution of reports by anonymity.")}</p>
                <div className="flex-grow">
                  <ResponsiveContainer className="select-none">
                    <PieChart margin={{ top: 25, right: 25, left: 10, bottom: 10 }}>
                      <Legend iconType="circle" />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #d3935c" }} itemStyle={{ color: "#00000080" }} />
                      <Pie data={chart.data} cx="50%" cy="50%" outerRadius={132} fill="#d3935c" nameKey="label" dataKey="value" stroke={chart.data.length === 1 ? "none" : "#fff"} labelLine={false} label={renderCustomizedLabel}>
                        {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Insights