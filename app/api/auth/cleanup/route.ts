import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// This is a cleanup endpoint for debugging
// Remove this in production!
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find and delete user from auth system
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const existingAuthUser = authUsers.users.find((user: User) => user.email === email)
    
    let authDeleted = false
    if (existingAuthUser) {
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id)
      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError)
      } else {
        authDeleted = true
      }
    }

    // Delete user from users table
    const { error: dbDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', email)

    return NextResponse.json({
      email,
      authUserFound: !!existingAuthUser,
      authDeleted,
      databaseDeleted: !dbDeleteError,
      dbDeleteError: dbDeleteError?.message || null
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 