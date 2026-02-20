import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    return NextResponse.json({
      success: true,
      isLoggedIn: !!session?.user,
      user: session?.user || null,
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { success: false, isLoggedIn: false, user: null },
      { status: 500 }
    )
  }
}

