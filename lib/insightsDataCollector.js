const getStatusCounts = (reports) => {
  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1
    return acc
  }, {})

  return statusCounts
}

const getCurrentMonthReports = (reports) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthReports = reports.filter(report => {
    const date = new Date(report.submittedAt)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const resolvedReports = currentMonthReports.filter(report => report.status === "resolved")
  const pendingReports = currentMonthReports.filter(report => report.status === "pending")

  return { currentMonthReports, resolvedReports, pendingReportsCount: pendingReports.length }
}

const getReportCategoriesData = (reports) => {
  const reportCategories = [
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

  const reportCategoriesData = reportCategories.map(category => {
    const count = reports.filter(report => report.category === category.value).length
    return { label: category.label, Reports: count }
  }).filter(data => data.Reports > 0).sort((a, b) => b.Reports - a.Reports)

  return reportCategoriesData
}

const getAvgResolutionTime = (resolvedReports) => {
  if (!resolvedReports.length) return 0

  const totalDays = resolvedReports.reduce((sum, r) => {
    const submitted = new Date(r.submittedAt)
    const resolved = new Date(r.resolvedAt)
    const diffInDays = (resolved - submitted) / (1000 * 60 * 60 * 24)
    return sum + diffInDays
  }, 0)

  return parseFloat((totalDays / resolvedReports.length).toFixed(1))
}

const getCitizenTypesData = (reports) => {
  const anonymousCount = reports.filter(r => r.isAnonymous).length
  const notAnonymousCount = reports.length - anonymousCount

  return [
    { label: "Anonymous", value: anonymousCount },
    { label: "Not Anonymous", value: notAnonymousCount }
  ].filter(entry => entry.value > 0)
}

const getReportsSubmissionData = (currentMonthReports) => {
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const intervals = [[1, 4], [5, 8], [9, 12], [13, 16], [17, 20], [21, 24], [25, 28], ...(daysInMonth > 28 ? [[29, daysInMonth]] : [])]

  return intervals.map(([start, end]) => {
    const count = currentMonthReports.filter(report => {
      const day = new Date(report.submittedAt).getDate()
      return day >= start && day <= end
    }).length

    return { Dates: `${start}-${end}`, Reports: count }
  })
}

const insightsDataCollector = async (reports) => {
  const statusCounts = getStatusCounts(reports)
  const { currentMonthReports, resolvedReports, pendingReportsCount } = getCurrentMonthReports(reports)

  const avgResolutionTimeInDays = getAvgResolutionTime(resolvedReports)

  const now = new Date()
  const lastMonth = now.getMonth() - 1
  const adjustedLastMonth = (lastMonth + 12) % 12
  const lastMonthYear = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear()

  const lastMonthResolved = reports.filter(report => {
    const resolvedAt = new Date(report.resolvedAt)
    return (report.status === "resolved" && resolvedAt.getMonth() === adjustedLastMonth && resolvedAt.getFullYear() === lastMonthYear)
  })

  const lastMonthAvg = getAvgResolutionTime(lastMonthResolved)

  const changeInTimeInDays =
    avgResolutionTimeInDays != null && lastMonthAvg != null
      ? parseFloat((avgResolutionTimeInDays - lastMonthAvg).toFixed(1))
      : 0

  const insightsData = {
    "cardsData": [
      {
        line1: "Total Reports",
        value: (statusCounts.pending || statusCounts.resolved) ? statusCounts.pending + statusCounts.resolved : 0,
        line2: currentMonthReports.length !== 0 ? `+${currentMonthReports.length} this month` : "None this month",
        line3: "All reports received to date."
      },
      {
        line1: "Avg. Resolution Time",
        value: `${avgResolutionTimeInDays} Days`,
        line2: changeInTimeInDays !== 0 ? `${changeInTimeInDays > 0 ? `+${changeInTimeInDays}` : changeInTimeInDays} days this month` : "No change this month",
        line3: "Average time to close a report."
      },
      {
        line1: "Resolved Reports",
        value: statusCounts.resolved ? statusCounts.resolved : 0,
        line2: resolvedReports.length !== 0 ? `+${resolvedReports.length} this month` : "None resolved this month",
        line3: "Reports successfully closed."
      },
      {
        line1: "Pending Reports",
        value: statusCounts.pending ? statusCounts.pending : 0,
        line2: pendingReportsCount !== 0 ? `+${pendingReportsCount} this month` : "None pending this month",
        line3: "Reports awaiting resolution."
      }
    ],
    reportCategoriesData: getReportCategoriesData(reports),
    reportStatusData: [
      { label: "Pending", value: statusCounts.pending },
      { label: "Resolved", value: statusCounts.resolved }
    ].filter(entry => entry.value > 0),
    citizenTypesData: getCitizenTypesData(reports),
    reportsSubmissionData: getReportsSubmissionData(currentMonthReports)
  }
  return insightsData
}

const statsCollector = async () => {
  try {
    return fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          return {
            totalUsersCount: data.statsData.totalUsersCount,
            totalReports: data.statsData.totalReports,
            avgResolutionTime: `${getAvgResolutionTime(data.statsData.resolvedReports)} Days`,
            resolvedReports: data.statsData.resolvedReports.length
          }
        }
        else return null
      })
  } catch (err) {
    console.error("Error fetching total users count : ", err)
    return null
  }
}

export { statsCollector }

export default insightsDataCollector