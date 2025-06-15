import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple test registration without any extra logic
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    console.log('Attempting to register:', { email })

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    console.log('Registration result:', { data: data.user?.id, error })

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        code: error.status,
        details: error 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.user?.id,
        email: data.user?.email,
        created_at: data.user?.created_at
      }
    })
  } catch (error) {
    console.error('Test registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 