import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'

// Initialize OpenAI client with OpenRouter
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
})

// Types for request body
interface CreateMemoryRequest {
    employeeId: string
    companyId: string
    content: string
    sourceType?: string
    sourceReference?: string
    metadata?: Record<string, unknown>
}

// Constants
const MAX_CONTENT_LENGTH = 8000 // OpenAI embedding token limit safety
const EMBEDDING_MODEL = 'text-embedding-3-small' // Better & cheaper than ada-002
const EMBEDDING_DIMENSIONS = 1536

/**
 * POST /api/ai-memory
 * Creates an AI embedding for employee content and stores it in the vector database.
 */
export async function POST(request: Request) {
    try {
        // 1. Authenticate the request
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in.' },
                { status: 401 }
            )
        }

        // 2. Parse and validate request body
        const body: CreateMemoryRequest = await request.json()

        if (!body.employeeId || !body.companyId || !body.content) {
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    details: 'employeeId, companyId, and content are required',
                },
                { status: 400 }
            )
        }

        // Security: Users can only create memories for themselves
        if (body.employeeId !== userId) {
            return NextResponse.json(
                { error: 'Forbidden. You can only create memories for your own account.' },
                { status: 403 }
            )
        }

        // Validate content length (rough token estimate: chars / 4)
        if (body.content.length > MAX_CONTENT_LENGTH * 4) {
            return NextResponse.json(
                {
                    error: 'Content too long',
                    details: `Content exceeds maximum length of approximately ${MAX_CONTENT_LENGTH} tokens.`,
                },
                { status: 400 }
            )
        }

        // 3. Initialize database connection
        const supabase = getSupabase()
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            )
        }

        console.log(`[AI Memory] Creating embedding for employee: ${body.employeeId}`)

        // 4. Generate embedding vector from OpenRouter/OpenAI
        let embedding: number[]
        try {
            const embeddingResponse = await openai.embeddings.create({
                model: EMBEDDING_MODEL,
                input: body.content,
                dimensions: EMBEDDING_DIMENSIONS,
            })

            embedding = embeddingResponse.data[0].embedding

            if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
                throw new Error(`Invalid embedding response. Expected ${EMBEDDING_DIMENSIONS} dimensions.`)
            }
        } catch (embeddingError: any) {
            console.error('[AI Memory] Embedding generation failed:', embeddingError)
            return NextResponse.json(
                {
                    error: 'Failed to generate embedding',
                    details: embeddingError.message,
                },
                { status: 502 }
            )
        }

        console.log(`[AI Memory] Embedding generated: ${embedding.length} dimensions`)

        // 5. Store in vector database
        const { data, error } = await supabase
            .from('employee_knowledge')
            .insert({
                employee_id: body.employeeId,
                company_id: body.companyId,
                content: body.content,
                embedding: embedding,
                source_type: body.sourceType || 'document',
                source_reference: body.sourceReference || null,
                metadata: body.metadata || {},
            })
            .select()
            .single()

        if (error) {
            console.error('[AI Memory] Database insert failed:', error)
            return NextResponse.json(
                {
                    error: 'Failed to save memory to database',
                    details: error.message,
                },
                { status: 500 }
            )
        }

        console.log(`[AI Memory] Memory saved successfully: ${data.id}`)

        // 6. Return success response
        return NextResponse.json(
            {
                success: true,
                message: 'AI memory created successfully',
                data: {
                    id: data.id,
                    employeeId: data.employee_id,
                    companyId: data.company_id,
                    sourceType: data.source_type,
                    contentPreview:
                        data.content.length > 100
                            ? `${data.content.slice(0, 100)}...`
                            : data.content,
                    createdAt: data.created_at,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('[AI Memory] Unexpected error:', error)

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message || 'Something went wrong',
            },
            { status: 500 }
        )
    }
}