import { NextResponse } from "next/server"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req) {
  try {
    const { name, email, mobile, role, password, address, state, city, pincode } = await req.json()

    if (!name || !email || !mobile || !role || !password || !address || !state || !city || !pincode) return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    if (await User.findOne({ email })) return NextResponse.json({ message: "Email already used" }, { status: 409 })
    if (await User.findOne({ mobile })) return NextResponse.json({ message: "Mobile No already used" }, { status: 409 })

    const hashedPass = await bcrypt.hash(password, 10)
    const user = new User({ name, email, mobile, role, password: hashedPass, address, state, city, pincode })
    await user.save()

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" })
    await cookies().set("token", token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 })
    const { name: userName, email: userEmail, mobile: userMobile, role: userRole, address: userAddress, state: userState, city: userCity, pincode: userPincode, registeredAt } = user
    return NextResponse.json({ success: true, user: { name: userName, email: userEmail, mobile: userMobile, role: userRole, address: userAddress, state: userState, city: userCity, pincode: userPincode, registeredAt } }, { status: 200 })
  } catch (err) {
    console.log(err)
    return NextResponse.json({ message: "Error in registration", error: err.message }, { status: 500 })
  }
}