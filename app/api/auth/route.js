import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import User from "@/lib/models/User"
import connectDB from "@/lib/db"

export async function GET(req) {
  const token = req.cookies.get("token")?.value
  if (!token) return NextResponse.json({ authenticated: false })

  try {
    await connectDB()
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))

    const user = await User.findById(payload.id).select("-password")
    if (!user) return NextResponse.json({ authenticated: false })

    const { name, email, mobile, role, address, state, city, pincode, registeredAt } = user
    return NextResponse.json({ authenticated: true, user: { name, email, mobile, role, address, state, city, pincode, registeredAt } })
  } catch (err) {
    return NextResponse.json({ authenticated: false })
  }
}