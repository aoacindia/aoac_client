"use server"

import { signOut } from "@/auth"

export async function logoutAction() {
  try {
    await signOut({ redirect: false })
    return { success: true }
  } catch (error) {
    console.error("Error during logout:", error)
    // Return success even on error to allow client to handle redirect
    return { success: true }
  }
}

