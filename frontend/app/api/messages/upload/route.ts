import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed: images, PDF, Word, Excel, text files' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS for storage uploads
    // The user authentication is already verified above
    const supabase = createServiceRoleClient()

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${orderId}/${Date.now()}.${fileExt}`
    const filePath = `attachments/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('messages')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)

      // Check if bucket doesn't exist
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
        return NextResponse.json(
          {
            error: 'Storage bucket not configured',
            details: 'The "messages" storage bucket has not been created in Supabase. Please follow the setup guide in MESSAGES_SETUP_GUIDE.md',
            hint: 'Go to Supabase Dashboard > Storage > Create a new bucket called "messages" and set it to public'
          },
          { status: 503 }
        )
      }

      // Check for policy/permission errors
      if (uploadError.message?.includes('policy') || uploadError.message?.includes('permission')) {
        return NextResponse.json(
          {
            error: 'Storage permissions not configured',
            details: 'Storage policies for the "messages" bucket are missing or incorrect. Please follow the setup guide in MESSAGES_SETUP_GUIDE.md',
            hint: 'The bucket needs INSERT policy for authenticated users and SELECT policy for public access'
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to upload file',
          details: uploadError.message
        },
        { status: 500 }
      )
    }

    // Get public URL
    const { data } = supabase.storage.from('messages').getPublicUrl(filePath)
    const fileUrl = data.publicUrl

    return NextResponse.json({
      success: true,
      attachment: {
        url: fileUrl,
        type: file.type,
        name: file.name,
        size: file.size,
      },
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
