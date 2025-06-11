"use server"
import { cookies } from "next/headers"

export async function deleteToken() {
  await cookies().delete("token")
}