import { NextResponse } from "next/server"
import Report from "@/lib/models/Report"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "20")

    if (searchParams.get("purpose") === "dashboard") {
      const reports = await Report.find()
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
      const total = await Report.countDocuments()

      return NextResponse.json({ success: true, reports, total }, { status: 200 })
    } else {
      const reports = await Report.find().sort({ submittedAt: -1 })
      return NextResponse.json({ success: true, reports }, { status: 200 })
    }
  } catch (err) {
    console.log(err)
    return NextResponse.json({ message: "Error fetching reports", error: err.message }, { status: 500 })
  }
}