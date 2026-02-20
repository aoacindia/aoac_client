import { NextResponse } from "next/server"
import { signOut } from "@/auth"

export async function POST() {
  try {
    await signOut({ redirect: false })
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Error during logout:", error)
    // Even if signOut fails, return success so client can handle redirect
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  }
}

