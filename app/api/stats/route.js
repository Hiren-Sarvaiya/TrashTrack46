import User from "@/lib/models/User"
import Report from "@/lib/models/Report"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const usersCount = await User.countDocuments()
    const reportsCount = await Report.countDocuments()
    const reports = await Report.find()
    const statsData = {
      totalUsersCount: usersCount ? usersCount : 0,
      totalReports: reportsCount ? reportsCount : 0,
      resolvedReports: reports.filter(report => report.status === "resolved")
    }
    return NextResponse.json({ success: true, statsData })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Failed to count users", error: err.message }, { status: 500 })
  }
}