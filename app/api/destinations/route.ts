import { NextResponse } from "next/server"
import { destinations } from "@/lib/data"

export async function GET() {
  try {
    return NextResponse.json(destinations)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 })
  }
}
