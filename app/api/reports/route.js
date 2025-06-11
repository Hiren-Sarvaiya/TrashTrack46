import { NextResponse } from "next/server"
import Report from "@/lib/models/Report"

export async function GET(req) {
  try {
    const reports = await Report.find().sort({ submittedAt: -1 })
    return NextResponse.json({ success: true, reports }, { status: 200 })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ message: "Error fetching reports", error: err.message }, { status: 500 })
  }
}