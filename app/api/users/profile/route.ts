import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, trip_type, interests, budget } = body

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, name, and email are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        name,
        email,
        phone,
        trip_type: trip_type || 'solo',
        interests: interests || [],
        budget: budget || 'medium'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, trip_type, interests, budget } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (trip_type) updateData.trip_type = trip_type
    if (interests) updateData.interests = interests
    if (budget) updateData.budget = budget

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 