/**
 * Itinerary API Routes
 * Handles CRUD operations for user itineraries
 * 
 * @author Gagassurya19
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all itineraries for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }



    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }


    return NextResponse.json(data || [])
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    )
  }
}

// POST - Create a new itinerary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { user_id, title, type, destination, duration, interests, budget, trip_type, data, start_date, end_date } = body

    if (!user_id || !title || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, title, type' },
        { status: 400 }
      )
    }

    // Prepare data for insertion
    const dataToInsert = {
      user_id,
      title,
      type,
      destination,
      duration,
      interests,
      budget,
      trip_type,
      data,
      start_date,
      end_date
    }

    // Use service role client to bypass RLS for now
    const { data: result, error } = await supabase
      .from('itineraries')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      
      // Special handling for RLS policy violations
      if (error.code === '42501') {
        return NextResponse.json(
          { 
            error: 'Database access denied',
            details: 'Row Level Security policy is blocking this operation',
            code: error.code,
            providedUserId: user_id,
            suggestion: 'Please run the fix-rls-policy.sql script to resolve this issue'
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: error.message, details: error.details, code: error.code },
        { status: 400 }
      )
    }


    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Failed to create itinerary' },
      { status: 500 }
    )
  }
} 