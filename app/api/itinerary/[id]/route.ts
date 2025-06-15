import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch a specific itinerary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data: itinerary, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching itinerary:', error)
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ itinerary })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update an itinerary
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
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
    } = body

    // Validate type if provided
    if (type && type !== 'manual' && type !== 'ai') {
      return NextResponse.json(
        { error: 'Invalid itinerary type. Must be "manual" or "ai"' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (type) updateData.type = type
    if (destination) updateData.destination = destination
    if (duration) updateData.duration = duration
    if (interests) updateData.interests = interests
    if (budget) updateData.budget = budget
    if (trip_type) updateData.trip_type = trip_type
    if (data) updateData.data = data
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date

    const { data: itinerary, error } = await supabase
      .from('itineraries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating itinerary:', error)
      return NextResponse.json(
        { error: 'Failed to update itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ itinerary })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an itinerary
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting itinerary:', error)
      return NextResponse.json(
        { error: 'Failed to delete itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Itinerary deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 