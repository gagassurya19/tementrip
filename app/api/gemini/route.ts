import { type NextRequest, NextResponse } from "next/server"
import { generateItinerary, generateDestinationInfo, answerTravelQuestion } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    let result

    switch (action) {
      case "generateItinerary":
        const { destination, days, interests, budget } = params
        result = await generateItinerary(destination, days, interests, budget)
        break

      case "getDestinationInfo":
        const { destination: dest } = params
        result = await generateDestinationInfo(dest)
        break

      case "answerQuestion":
        const { question } = params
        result = await answerTravelQuestion(question)
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error("Error in Gemini API route:", error)

    // Check if it's a quota exceeded error
    if (error.message === "API_QUOTA_EXCEEDED") {
      return NextResponse.json(
        {
          error: "API quota exceeded",
          message: "We've reached our API usage limit. Please try again later.",
          isQuotaError: true,
        },
        { status: 429 },
      )
    }

    // Check if all models are unavailable
    if (error.message?.includes("All Gemini models are currently unavailable")) {
      return NextResponse.json(
        {
          error: "Service temporarily unavailable",
          message: "All AI models are currently overloaded. Please try again in a few minutes.",
          isServiceUnavailable: true,
          details: error.message,
        },
        { status: 503 },
      )
    }

    // Check for specific model overload errors
    if (error.message?.includes("overloaded") || error.status === 503) {
      return NextResponse.json(
        {
          error: "Service overloaded",
          message: "The AI service is experiencing high demand. Please try again shortly.",
          isOverloaded: true,
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to process request",
        message: "An unexpected error occurred. Please try again later.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
