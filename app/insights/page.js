"use client"
import { useAppContext } from "@/context/AppContext"
import { useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const Insights = () => {
  const { setIsPageLoaded } = useAppContext()

  useEffect(() => {
    const handleLoad = () => requestAnimationFrame(() => setIsPageLoaded(true))

    if (document.readyState === "complete") handleLoad()
    else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  const cardData = [
    { line1: "Total Reports", value: "1469", line2: "+69 this month", line3: "All reports received to date." },
    { line1: "Resolved Reports", value: "839", line2: "+16 this month", line3: "Reports successfully closed." },
    { line1: "Pending Reports", value: "630", line2: "+8 this month", line3: "Reports awaiting officer action." },
    { line1: "Avg. Resolution Time", value: "4.2 Days", line2: "-0.7 days since last month", line3: "Average time to close a report." },
  ]

  const lineData = [
    { Dates: "1-4", Reports: 30 },
    { Dates: "5-8", Reports: 45 },
    { Dates: "9-12", Reports: 60 },
    { Dates: "13-16", Reports: 50 },
    { Dates: "17-20", Reports: 70 },
    { Dates: "21-24", Reports: 65 },
    { Dates: "25-28", Reports: 35 },
    { Dates: "29-31", Reports: 45 }
  ]

  const pieData1 = [
    { name: "Garbage", value: 400 },
    { name: "Dead Animals", value: 300 },
    { name: "Overflow", value: 300 },
    { name: "Illegal Dumping", value: 200 }
  ]

  const pieData2 = [
    { name: "Pending", value: 300 },
    { name: "Resolved", value: 500 }
  ]

  const pieData3 = [
    { name: "Anonymous", value: 425 },
    { name: "Not Anonymous", value: 225 }
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF69B4", "#7ED957", "#FFA07A", "#20B2AA", "#BA55D3", "#D2691E"]

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return <text x={x} y={y} className="pointer-events-none" fill="white" textAnchor="middle" dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>
  }

  return (
    <main className="p-4">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-[1000] font-[Public_sans] mb-4">INSIGHTS</h1>
        <section className="font-[Roboto] mb-4 flex gap-4">
          <div className="flex gap-4 h-fit w-full">
            {cardData.map((card, i) => (
              <div key={i} className="stats p-3 pr-16 h-fit w-fit border-2 border-[var(--primary-color-50)] rounded-xl">
                <h3 className="text-lg text-black/60 mb-1">{card.line1}</h3>
                <h1 className="text-4xl font-bold">{card.value}</h1>
                <div className="text-green-400 text-sm mb-3">{card.line2}</div>
                <p className="text-black/60 text-nowrap">{card.line3}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="flex gap-4 mb-4">
          {[{ title: "Report Status", data: pieData2 }, { title: "Report Categories", data: pieData1 }, { title: "Citizen Types", data: pieData3 }].map((chart, i) => (
            <div key={i} className="h-[348px] w-1/2 p-3 pl-4 border-2 border-[var(--primary-color-50)] rounded-xl flex flex-col">
              <h2 className="text-2xl font-semibold">{chart.title}</h2>
              <p className="text-black/60">{i === 0 ? "Current distribution of report statuses." : (i === 1 ? "Breakdown of Reports by category." : "Distribution of reports by anonymity.")}</p>
              <div className="flex-grow">
                <ResponsiveContainer>
                  <PieChart margin={{ right: chart.data.length > 4 ? 60 : 0 }}>
                    <Legend iconType="circle" layout={chart.data.length > 4 ? "vertical" : "horizontal"} verticalAlign={chart.data.length > 4 ? "middle" : "bottom"} align={chart.data.length > 4 ? "right" : "center"} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #d3935c" }} labelStyle={{ color: "#d3935c" }} itemStyle={{ color: "#00000080" }} />
                    <Pie data={chart.data} cx="50%" cy="50%" outerRadius={100} fill="#d3935c" dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                      {chart.data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </section>
        <section>
          <div className="flex gap-4 mb-4">
            {[{ title: "Reports Inflow Overview", data: lineData }, { title: "Report Resolution Rate", data: lineData }].map((chart, i) => (
              <div key={i} className="h-[448px] w-1/2 p-3 pl-4 border-2 border-[var(--primary-color-50)] rounded-xl flex flex-col">
                <h2 className="text-2xl font-semibold">{chart.title}</h2>
                <p className="text-black/60">{i === 0 ? "Report submissions grouped in 4 day intervals for this month." : "Resolved report counts grouped in 4 day intervals for this month."}</p>
                <div className="flex-grow">
                  <ResponsiveContainer>
                    <LineChart data={chart.data} margin={{ top: 25, right: 25, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="Dates" stroke="#00000080" padding={{ left: 25, right: 25 }} />
                      <YAxis width={32} stroke="#00000080" />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #d3935c" }} labelStyle={{ color: "#d3935c" }} itemStyle={{ color: "#00000080" }} />
                      <Legend />
                      <Line type="natural" dataKey="Reports" stroke="#d3935c" strokeWidth={2} activeDot={{ r: 7 }} />
                    </LineChart>
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