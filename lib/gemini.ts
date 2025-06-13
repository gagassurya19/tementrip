import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Model configuration with priority order
const MODEL_PRIORITY = [
  { name: "models/gemini-2.0-flash", maxTokens: 1024, description: "Primary model (1.5M RPD)" },
  { name: "models/gemini-2.0-flash-lite", maxTokens: 1024, description: "Lite version with higher rate limits (1.5M RPD)" },
  { name: "models/gemini-1.5-flash", maxTokens: 1024, description: "Previous generation flash (500 RPD)" },
  { name: "models/gemini-1.5-flash-8b", maxTokens: 1024, description: "8B parameter flash model (500 RPD)" },
  { name: "models/gemini-2.0-flash-experimental", maxTokens: 1024, description: "Experimental version (1K RPD)" },
  { name: "models/gemini-2.5-flash", maxTokens: 1024, description: "Preview model with high limits (500 RPD)" },
]

// Initialize the Gemini API client
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables")
  }

  return new GoogleGenerativeAI(apiKey)
}

// Configure safety settings
export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Check if error indicates model overload or service unavailable
function isModelOverloadedError(error: any): boolean {
  const errorMessage = error.message?.toLowerCase() || ""
  const status = error.status || 0
  
  return (
    status === 503 || // Service Unavailable
    status === 429 || // Too Many Requests
    errorMessage.includes("overloaded") ||
    errorMessage.includes("service unavailable") ||
    errorMessage.includes("too many requests") ||
    errorMessage.includes("rate limit") ||
    errorMessage.includes("quota")
  )
}

// Generate text with automatic model fallback
export async function generateText(prompt: string, systemPrompt?: string) {
  const genAI = getGeminiClient()
  let lastError: any = null
  let attemptCount = 0

  console.log(`🤖 Starting generation with ${MODEL_PRIORITY.length} available models`)

  for (const modelConfig of MODEL_PRIORITY) {
    attemptCount++
    try {
      console.log(`🔄 Attempt ${attemptCount}/${MODEL_PRIORITY.length}: Trying model ${modelConfig.name} (${modelConfig.description})`)
      
      const model = genAI.getGenerativeModel({ model: modelConfig.name })

      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: modelConfig.maxTokens,
      }

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig,
        safetySettings,
      })

      console.log(`✅ Successfully generated text using model: ${modelConfig.name} on attempt ${attemptCount}`)
      return result.response.text()
      
    } catch (error: any) {
      console.error(`❌ Model ${modelConfig.name} failed on attempt ${attemptCount}:`, error.message)
      lastError = error
      
      // If it's not an overload error, don't try other models
      if (!isModelOverloadedError(error)) {
        console.error("⚠️ Non-overload error occurred, not trying other models")
        break
      }
      
      // If this is the last model, we'll throw the error
      if (modelConfig === MODEL_PRIORITY[MODEL_PRIORITY.length - 1]) {
        console.error("🚫 All models failed, throwing last error")
        break
      }
      
      // Wait a bit before trying the next model (progressive backoff)
      const waitTime = 1000 + (MODEL_PRIORITY.indexOf(modelConfig) * 500)
      console.log(`⏳ Waiting ${waitTime}ms before trying next model...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  // If we get here, all models failed
  console.error(`🔥 All ${attemptCount} Gemini models failed, falling back to error handling`)
  
  // Check if it's a quota exceeded error
  if (lastError?.message && lastError.message.includes("quota")) {
    throw new Error("API_QUOTA_EXCEEDED")
  }
  
  // Throw a comprehensive error
  throw new Error(`All Gemini models are currently unavailable. Last error: ${lastError?.message || "Unknown error"}`)
}

// Generate travel itinerary with fallback for quota errors
export async function generateItinerary(destination: string, days: number, interests: string[], budget: string) {
  try {
    const prompt = `
      Kamu adalah travel buddy yang berpengalaman dan akan membantu merencanakan liburan ${days} hari ke ${destination}. 
      Minat: ${interests.join(", ")}
      Budget: ${budget}
      
      Buat itinerary dengan struktur yang rapi tapi bahasa yang santai dan friendly:
      
      Format yang diinginkan:
      - Mulai dengan intro singkat tentang overall plan
      - Bagi per hari dengan jelas (Hari 1, Hari 2, dst)
      - Setiap hari jelaskan aktivitas pagi, siang, sore, malam
      - Sertakan estimasi biaya dengan cara yang natural
      - Kasih tips praktis dan insight personal di setiap hari
      - Akhiri dengan tips umum untuk perjalanan
      
      Gaya bahasa dan format:
      - Conversational tapi informatif
      - Gunakan "aku", "kamu" dan bahasa sehari-hari  
      - Jelaskan kenapa tempat tersebut worth it dikunjungi
      - Berikan context dan background yang menarik
      - Sesuaikan dengan minat dan budget yang diminta
      
      Format yang HARUS digunakan dengan benar:
      - Gunakan "Hari 1:", "Hari 2:" dst untuk pembagian hari
      - **bold** untuk nama tempat/aktivitas penting (contoh: **Candi Borobudur**)
      - *italic* untuk istilah asing (contoh: *sunrise*)  
      - @budget@ untuk informasi harga (contoh: @Rp 50.000 per orang@)
      - [highlight] untuk rekomendasi khusus (contoh: [Datang pagi untuk sunrise])
      - "Tips:" di awal kalimat untuk tips khusus
      - Pisahkan setiap aktivitas/tempat dengan paragraf baru
      
      Contoh: "Hari 1: Aku saranin kamu mulai santai dulu. Pagi-pagi bisa ke **Pantai Kuta** karena..."
      
      Buatkan itinerary yang comprehensive, well-organized, dengan visual formatting menarik tapi tetap fun dan personal!
    `

    return await generateText(prompt)
  } catch (error: any) {
    if (error.message === "API_QUOTA_EXCEEDED") {
      return getFallbackItinerary(destination, days, interests, budget)
    }
    throw error
  }
}

// Generate destination information with fallback for quota errors
export async function generateDestinationInfo(destination: string) {
  try {
    const prompt = `
      Kamu adalah travel expert yang akan share info lengkap tentang ${destination}. Berikan informasi yang terstruktur tapi dengan gaya bicara yang santai dan friendly.
      
      Format yang diinginkan dengan struktur yang jelas:
      
      1. Intro singkat tentang ${destination} secara umum
      2. Waktu terbaik berkunjung (cuaca, musim, event)
      3. Tempat wisata utama dan hidden gems  
      4. Kuliner lokal yang wajib dicoba
      5. Budaya dan adat yang perlu diketahui
      6. Transportasi dan cara berkeliling
      7. Tips keamanan dan praktis
      8. Ringkasan dan saran akhir
      
      Gaya bahasa dan format yang diinginkan:
      - Conversational dan personal, seperti ngobrol sama teman
      - Gunakan "aku", "kamu" dan bahasa sehari-hari
      - Kasih insight dan tips berdasarkan pengalaman
      - Jelaskan dengan detail tapi tetap asik dibaca
      - Berikan context dan alasan di balik setiap rekomendasi
      - Sertakan info praktis yang berguna
      
      Format visual yang HARUS digunakan dengan benar:
      - **bold** untuk nama tempat/info penting (contoh: **Borobudur Temple**)
      - *italic* untuk istilah khusus (contoh: *sunrise viewing*)
      - [rekomendasi] untuk saran khusus (contoh: [Booking online lebih murah])
      - @budget@ untuk informasi biaya (contoh: @Tiket masuk Rp 50.000@)
      - "Tips:" di awal untuk tips praktis
      - "Penting:" di awal untuk hal yang harus diperhatikan
      - Gunakan "1. Judul", "2. Judul" untuk section utama
      - Pisahkan setiap tempat/topik dengan paragraf terpisah
      
      Contoh: "Kalau kamu mau ke ${destination}, aku saranin timing yang paling pas itu..."
      "Yang bikin ${destination} **special banget** adalah..."
      "Tips: Pro tip dari pengalaman aku..."
      
      Bikin informasinya comprehensive, well-organized, dengan formatting visual yang menarik tapi tetap enjoyable untuk dibaca!
    `

    return await generateText(prompt)
  } catch (error: any) {
    if (error.message === "API_QUOTA_EXCEEDED") {
      return getFallbackDestinationInfo(destination)
    }
    throw error
  }
}

// Answer travel-related questions with fallback for quota errors
export async function answerTravelQuestion(question: string) {
  try {
    const prompt = `
      Kamu adalah seorang travel expert yang ramah dan berpengalaman. Jawab pertanyaan berikut dengan gaya bicara yang santai tapi tetap terstruktur dan lengkap:
      ${question}
      
      Format jawaban dengan struktur yang jelas tapi bahasa yang natural:
      
      1. Mulai dengan intro yang friendly dan langsung to the point
      2. Bagi informasi dalam beberapa section utama yang relevan
      3. Setiap section jelaskan dengan detail tapi bahasa santai
      4. Akhiri dengan ringkasan dan tips praktis
      
      Gaya bahasa dan format yang diinginkan:
      - Conversational dan friendly, tapi tetap informatif
      - Gunakan "aku", "kamu", dan bahasa sehari-hari
      - Jelaskan dengan detail tapi tetap asik dibaca  
      - Berikan insight personal dan tips berdasarkan pengalaman
      - Hindari jargon yang terlalu formal
      
      Format markdown yang HARUS digunakan dengan benar:
      - **bold** untuk nama tempat, aktivitas utama (contoh: **Gudeg Yu Djum**)
      - *italic* untuk istilah asing atau highlight khusus (contoh: *road trip*)
      - [highlight] untuk rekomendasi khusus (contoh: [Cobain yang di Wijilan])
      - @harga@ untuk informasi harga/budget (contoh: @Mulai dari Rp 25.000@)
      - Gunakan "Tips:" di awal paragraf untuk tips khusus
      - Gunakan "Penting:" di awal untuk warning/hal penting
      - Gunakan "1. Judul Section", "2. Judul Section" untuk header utama
      - Pisahkan setiap tempat makan/item dengan paragraf terpisah
      
      Contoh pembuka: "Nah, soal waktu terbaik ke Bali, aku bagi jadi beberapa kategori nih supaya kamu bisa pilih sesuai preferensi..."
      
      Pastikan jawaban comprehensive, well-structured, dengan visual formatting yang menarik tapi tetap terasa natural seperti ngobrol sama teman yang expert.
    `

    return await generateText(prompt)
  } catch (error: any) {
    if (error.message === "API_QUOTA_EXCEEDED") {
      return getFallbackAnswer(question)
    }
    throw error
  }
}

// Fallback functions for when API quota is exceeded

function getFallbackItinerary(destination: string, days: number, interests: string[], budget: string) {
  return `
    # ${days}-Day ${destination} Itinerary

    I apologize, but I'm currently unable to generate a personalized itinerary due to API usage limits. 
    
    ## General Recommendations:
    
    - Research popular attractions in ${destination} that match your interests: ${interests.join(", ")}
    - Look for accommodations that fit your ${budget} budget
    - Check local tourism websites for current events during your visit
    - Consider booking guided tours for the best experience
    
    Please try again later when our API quota has reset, or contact customer support for assistance.
  `
}

function getFallbackDestinationInfo(destination: string) {
  return `
    # Information about ${destination}

    I apologize, but I'm currently unable to provide detailed information about ${destination} due to API usage limits.
    
    ## General Travel Tips:
    
    - Research the best time to visit based on weather and tourist seasons
    - Check visa requirements before traveling
    - Look up local customs and etiquette
    - Research public transportation options
    - Consider travel insurance for your trip
    
    Please try again later when our API quota has reset, or contact customer support for assistance.
  `
}

function getFallbackAnswer(question: string) {
  return `
    I apologize, but I'm currently unable to answer your question due to API usage limits.
    
    Please try again later when our API quota has reset, or contact customer support for assistance.
    
    In the meantime, you might find answers by:
    - Checking travel guidebooks
    - Visiting official tourism websites
    - Checking travel forums like TripAdvisor
    - Consulting with a travel agent
  `
}
