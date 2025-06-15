import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

// Ensure environment variables are available
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Client-side Supabase instance (singleton pattern)
let supabaseInstance: any = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
  return supabaseInstance
})()

// Server-side Supabase instance (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone?: string
          trip_type?: string
          interests?: string[]
          budget?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string
          trip_type?: string
          interests?: string[]
          budget?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          trip_type?: string
          interests?: string[]
          budget?: string
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          place_id: string
          title: string
          image_url?: string
          city: string
          state: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          title: string
          image_url?: string
          city: string
          state: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_id?: string
          title?: string
          image_url?: string
          city?: string
          state?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          destination_id: string
          destination_name: string
          start_date: string
          end_date: string
          status: 'confirmed' | 'pending' | 'cancelled'
          guests: number
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination_id: string
          destination_name: string
          start_date: string
          end_date: string
          status?: 'confirmed' | 'pending' | 'cancelled'
          guests: number
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination_id?: string
          destination_name?: string
          start_date?: string
          end_date?: string
          status?: 'confirmed' | 'pending' | 'cancelled'
          guests?: number
          total_price?: number
          updated_at?: string
        }
      }
      itineraries: {
        Row: {
          id: string
          user_id: string
          title: string
          type: 'manual' | 'ai'
          destination: string
          duration: string
          interests: string[]
          budget: string
          trip_type: string
          data: any // JSONB data: for manual = selectedDestinations[], for AI = aiItinerary text
          start_date?: string
          end_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: 'manual' | 'ai'
          destination: string
          duration: string
          interests: string[]
          budget: string
          trip_type: string
          data: any
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: 'manual' | 'ai'
          destination?: string
          duration?: string
          interests?: string[]
          budget?: string
          trip_type?: string
          data?: any
          start_date?: string
          end_date?: string
          updated_at?: string
        }
      }
    }
  }
} 