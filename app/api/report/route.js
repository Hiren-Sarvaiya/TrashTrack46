import { NextResponse } from "next/server"
import Report from "@/lib/models/Report"
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/imagesHandlers"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  const imageFiles = []
  try {
    const formData = await req.formData()
    const title = formData.get("title")?.trim()
    const desc = formData.get("desc")?.trim()
    const category = formData.get("category")?.trim()
    const address = formData.get("address")?.trim()
    const state = formData.get("state")?.trim()
    const city = formData.get("city")?.trim()
    const pincode = Number(formData.get("pincode"))
    const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : undefined
    const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : undefined
    const isAnonymous = formData.get("isAnonymous") === "true"
    const submittedBy = isAnonymous
      ? await bcrypt.hash(formData.get("submittedBy") || "", 10)
      : formData.get("submittedBy")?.trim()
    console.log(title, desc, category, address, state, city, pincode, submittedBy, isAnonymous)

    if (!title || !desc || !category || !address || !state || !city || !pincode || !submittedBy) return NextResponse.json({ message: "Required fields are unavailable" }, { status: 400 })

    for (const key of formData.keys()) {
      if (key.startsWith("image") && formData.get(key) instanceof File) {
        const file = formData.get(key)
        const uploadRes = await uploadToCloudinary(file)
        if (uploadRes) imageFiles.push(uploadRes)
      }
    }

    const report = new Report({ title, desc, category, address, state, city, pincode, ...(latitude && { latitude }), ...(longitude && { longitude }), images: imageFiles.map(img => img.secure_url), submittedBy, isAnonymous })
    await report.save()

    return NextResponse.json({ success: true, message: "Report submitted successfully" }, { status: 200 })
  } catch (err) {
    console.error(err)
    if (imageFiles.length > 0) {
      for (const img of imageFiles) {
        try {
          await deleteFromCloudinary(img.public_id)
        } catch (delErr) {
          console.error("Failed to delete image:", img.public_id, delErr)
        }
      }
    }
    return NextResponse.json({ message: "Error submitting report", error: err.message }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const submittedBy = searchParams.get("submittedBy")
    const reportId = searchParams.get("reportId")

    if (reportId) {
      const report = await Report.findById(reportId)
      if (!report) return NextResponse.json({ message: "Report not found" }, { status: 404 })
      return NextResponse.json({ success: true, report }, { status: 200 })
    }

    if (submittedBy) {
      const allReports = await Report.find().sort({ submittedAt: -1 })
      const matchedReports = []

      for (const report of allReports) {
        if (report.submittedBy === submittedBy) {
          matchedReports.push(report)
        } else {
          if (await bcrypt.compare(submittedBy, report.submittedBy)) matchedReports.push(report)
        }
      }

      return NextResponse.json({ success: true, reports: matchedReports }, { status: 200 })
    }

    return NextResponse.json({ message: "Either reportId or submittedBy is required" }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Error fetching report(s)", error: err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const reportId = searchParams.get("reportId")
    if (!reportId) return NextResponse.json({ message: "Report id is required" }, { status: 400 })

    const report = await Report.findById(reportId)
    if (!report) return NextResponse.json({ message: "Report not found" }, { status: 404 })

    const allImages = [...(report.images || []), ...(report.resolvedImages || [])]
    for (const imgUrl of allImages) {
      try {
        const publicId = imgUrl.split("/trashtrack/")[1]?.split('.')[0]
        if (publicId) await deleteFromCloudinary(`trashtrack/${publicId}`)
      } catch (delErr) {
        console.error("Failed to delete image : ", imgUrl, delErr)
      }
    }
    await Report.findByIdAndDelete(reportId)

    return NextResponse.json({ success: true, message: "Report deleted successfully" }, { status: 200 })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ message: "Error deleting report", error: err.message }, { status: 500 })
  }
}