import { NextResponse } from "next/server"
import Report from "@/lib/models/Report"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/imagesHandlers"

export async function POST(req) {
  const imageFiles = []
  try {
    const { searchParams } = new URL(req.url)
    const reportId = searchParams.get("reportId")
    if (!reportId) return NextResponse.json({ message: "Id is required" }, { status: 400 })

    const formData = await req.formData()
    const officerResponse = formData.get("officerResponse")?.trim()
    const resolvedBy = formData.get("resolvedBy")?.trim()

    if (!officerResponse || !resolvedBy) return NextResponse.json({ message: "Required fields are unavailable" }, { status: 400 })

    for (const key of formData.keys()) {
      if (key.startsWith("image") && formData.get(key) instanceof File) {
        const file = formData.get(key)
        const uploadRes = await uploadToCloudinary(file)
        if (uploadRes) imageFiles.push(uploadRes)
      }
    }
    console.log("resolve data :")
    console.log(officerResponse, resolvedBy)
    console.log("images aai chhe : ", imageFiles)

    await Report.findByIdAndUpdate(reportId, { $push: { resolvedImages: { $each: imageFiles.map(img => img.secure_url) } }, $set: { status: "resolved", officerResponse, resolvedBy, resolvedAt: new Date() } })
    return NextResponse.json({ success: true, message: "Report resolved successfully" }, { status: 200 })
  } catch (err) {
    console.error("Error resolving report : ", err)
    if (imageFiles.length > 0) {
      for (const img of imageFiles) {
        try {
          await deleteFromCloudinary(img.public_id)
        } catch (delErr) {
          console.error("Failed to delete image : ", img.public_id, delErr)
        }
      }
    }
    return NextResponse.json({ message: "Error resolving report", error: err.message }, { status: 500 })
  }
}