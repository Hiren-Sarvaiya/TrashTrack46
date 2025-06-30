import { NextResponse } from "next/server"
import Report from "@/lib/models/Report"
import connectDB from "@/lib/db"

export async function GET(req) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "20")
    const view = searchParams.get("view")

    if (view === "officer-dashboard") {
      const { status = "all", category = "all", anonymous = "all", city = "all", state = "all", searchQuery = "", skip = "0", limit = "20" } = Object.fromEntries(searchParams.entries())
      const skipNum = parseInt(skip)
      const limitNum = parseInt(limit)

      const query = {}
      if (status !== "all") query.status = status
      if (category !== "all") query.category = category
      if (anonymous !== "all") query.isAnonymous = anonymous === "anonymous"
      if (city !== "all") query.city = city
      if (state !== "all") query.state = state

      if (searchQuery.trim() !== "") {
        const searchWords = searchQuery.toLowerCase().trim().split(/\s+/)
        query.$and = searchWords.map(word => ({
          title: { $regex: new RegExp(word, "i") }
        }))
      }

      const reports = await Report.find(query)
        .sort({ submittedAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
      const total = await Report.countDocuments(query)

      return NextResponse.json({ success: true, reports, total }, { status: 200 })
    } else if (view === "citizen-dashboard") {
      const submittedBy = searchParams.get("submittedBy")
      if (!submittedBy) return NextResponse.json({ success: false, message: "SubmittedBy is required" }, { status: 400 })

      const status = searchParams.get("status") || "all"
      const searchQuery = searchParams.get("searchQuery")?.toLowerCase().trim() || ""
      const searchWords = searchQuery.split(/\s+/)

      const allReports = await Report.find().sort({ submittedAt: -1 })
      const matchedReports = []

      for (const r of allReports) {
        const isHash = /^[a-f0-9]{32,128}$/i.test(r.submittedBy)
        const ok = isHash ? await bcrypt.compare(submittedBy, r.submittedBy) : r.submittedBy === submittedBy
        if (!ok) continue

        if ((status === "all" || r.status === status) && (searchQuery === "" || searchWords.every(q => r.title.toLowerCase().includes(q)))) matchedReports.push(r)
      }

      return NextResponse.json({ success: true, reports: matchedReports.slice(skip, skip + limit), total: matchedReports.length }, { status: 200 })
    } else if (view === "insights") {
      const allReports = await Report.find().sort({ submittedAt: -1 })
      return NextResponse.json({ success: true, reports: allReports }, { status: 200 })
    }
  } catch (err) {
    console.log("Error getting reports : ", err)
    return NextResponse.json({ message: "Error fetching reports" }, { status: 500 })
  }
}