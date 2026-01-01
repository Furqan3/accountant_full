import { NextRequest, NextResponse } from 'next/server'
import { getUser, createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      company_number,
      company_name,
      company_status,
      company_type,
      date_of_creation,
      address,
      confirmation_statement_due,
      accounts_due,
      is_favorite = false,
      notes = null,
    } = body

    if (!company_number || !company_name) {
      return NextResponse.json(
        { error: 'Company number and name are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Check if company already exists for this user
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_number', company_number)
      .single()

    if (existing) {
      // Update existing company
      const { data, error } = await supabase
        .from('companies')
        .update({
          company_name,
          company_status,
          company_type,
          date_of_creation,
          address,
          confirmation_statement_due,
          accounts_due,
          is_favorite,
          notes,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ company: data }, { status: 200 })
    }

    // Create new company
    const { data, error } = await supabase
      .from('companies')
      .insert({
        user_id: user.id,
        company_number,
        company_name,
        company_status,
        company_type,
        date_of_creation,
        address,
        confirmation_statement_due,
        accounts_due,
        is_favorite,
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ company: data }, { status: 201 })
  } catch (error) {
    console.error('Save company error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
