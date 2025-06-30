import { NextResponse } from "next/server"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import connectDB from "@/lib/db"

export async function POST(req) {
  try {
    await connectDB()
    const { email, mobile, password } = await req.json()
    let user = null

    if (password) {
      if (email) user = await User.findOne({ email })
      else if (mobile) user = await User.findOne({ mobile })
      else return NextResponse.json({ message: "Email or mobile no is required" }, { status: 400 })
    } else {
      return NextResponse.json({ message: "Password is required" }, { status: 400 })
    }

    if (!user) return NextResponse.json({ message: "User doesn't exist" }, { status: 404 })
    if (!(await bcrypt.compare(password, user.password))) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" })
    await cookies().set("token", token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 })
    const { name, email: userEmail, mobile: userMobile, role, address, state, city, pincode, registeredAt } = user
    return NextResponse.json({ success: true, user: { name, email: userEmail, mobile: userMobile, role, address, state, city, pincode, registeredAt } }, { status: 200 })
  } catch (err) {
    console.log("Error logging in : ", err)
    return NextResponse.json({ message: "Error in login" }, { status: 500 })
  }
}