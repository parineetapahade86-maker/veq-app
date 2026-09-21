import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const userId = formData.get('userId') as string
        const companyId = formData.get('companyId') as string

        if (!file || !userId || !companyId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check file size (max 500MB)
        if (file.size > 500 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size exceeds 500MB limit' },
                { status: 400 }
            )
        }

        // Create Supabase client with SERVICE ROLE KEY (bypasses RLS)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Generate file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        const filePath = `${companyId}/${fileName}`

        // Convert file to buffer and upload
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('videos')
            .upload(filePath, buffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(filePath)

        // Save to database
        const { data: dbData, error: dbError } = await supabase
            .from('videos')
            .insert({
                employee_id: userId,
                company_id: companyId,
                title: file.name,
                url: urlData.publicUrl,
                storage_path: filePath,
                source_type: 'upload',
                metadata: {
                    size: file.size,
                    type: file.type,
                    uploaded_by: userId
                }
            })
            .select()
            .single()

        if (dbError) throw dbError

        return NextResponse.json({
            success: true,
            data: dbData,
            message: 'Video uploaded successfully'
        })

    } catch (error: any) {
        console.error('API Upload Error:', error)
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        )
    }
}