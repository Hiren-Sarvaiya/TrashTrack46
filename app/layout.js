import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"
import connectDB from "@/lib/db"
import Header from "@/components/Header/Header"
import { ToastContainer, Bounce } from "react-toastify"
import Footer from "@/components/Footer"
import { cookies } from "next/headers"
import { AuthProvider } from "@/context/AppContext"
import ClientWrapper from "@/components/ClientWrapper"

await connectDB()

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata = {
  title: "Home | TrashTrack",
  description: "TrashTrack empowers citizens to report waste issues, track cleanups, and hold authorities accountable. Clean streets begin with action.",
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider token={token}>
          <Header />
          <ClientWrapper>{children}</ClientWrapper>
          <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnHover pauseOnFocusLoss draggable={false} theme="light" transition={Bounce} />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}