import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(req) {
  const token = req.cookies.get("token")?.value
  const path = req.nextUrl.pathname

  const authPages = ["/login", "/register"]
  const protectedApis = ["/api/report", "/api/reports"]
  const protectedPages = ["/dashboard", "/profile"]

  const isAuthPage = authPages.some(p => path.startsWith(p))
  const isProtectedApi = protectedApis.some(p => path.startsWith(p))
  const isProtectedPage = protectedPages.some(p => path.startsWith(p))

  if (token && isAuthPage) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      return NextResponse.redirect(new URL("/dashboard", req.url))
    } catch {
      return NextResponse.next()
    }
  }

  if (isProtectedApi || isProtectedPage) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url))

    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    "/api/report",
    "/api/reports"
  ]
}