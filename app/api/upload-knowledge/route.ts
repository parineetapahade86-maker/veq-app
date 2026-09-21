import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'
import OpenAI from 'openai'
import PDFParser from 'pdf2json'

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
})

// ---------- Helpers ----------

/** Extract text content from a PDF buffer */
const extractTextFromPDF = (buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser()

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            let fullText = ''

            if (pdfData.Pages) {
                pdfData.Pages.forEach((page: any) => {
                    if (page.Texts) {
                        page.Texts.forEach((textItem: any) => {
                            if (textItem.R && textItem.R.length > 0) {
                                fullText += decodeURIComponent(textItem.R[0].T) + ' '
                            }
                        })
                        fullText += '\n\n'
                    }
                })
            }

            resolve(fullText)
        })

        pdfParser.on('pdfParser_dataError', (errData: any) => {
            reject(new Error(errData.parserError || 'PDF parsing failed'))
        })

        pdfParser.parseBuffer(buffer)
    })
}

/** Extract entities from text using AI */
const extractEntities = async (text: string) => {
    // Default empty structure in case anything fails
    const emptyEntities = {
        people: [] as string[],
        organizations: [] as string[],
        topics: [] as string[],
        dates: [] as string[],
        action_items: [] as string[],
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini', // ⚠️ Verify the exact model ID in your OpenRouter dashboard
            messages: [
                {
                    role: 'system',
                    content: `You are an entity extraction AI. Analyze the text and extract key entities. Return ONLY a valid JSON object with these arrays:
{
  "people": ["name1", "name2"],
  "organizations": ["company1", "company2"],
  "topics": ["topic1", "topic2"],
  "dates": ["date1", "date2"],
  "action_items": ["task1", "task2"]
}
If nothing is found for a category, use an empty array. Keep it concise, max 5 items per category. No markdown, no explanation.`,
                },
                {
                    role: 'user',
                    content: `Extract entities from this text: ${text.substring(0, 4000)}`,
                },
            ],
            temperature: 0.3,
            max_tokens: 1000, // 💰 cost control
        })

        let aiText = completion.choices[0]?.message?.content || '{}'
        // Strip markdown code fences if the model wraps JSON in them
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(aiText)
    } catch (err) {
        console.error('[Entity Extraction] Error:', err)
        return emptyEntities
    }
}

// ---------- POST: Upload knowledge (file or text) and extract entities ----------

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = getSupabase()
        if (!supabase) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
        }

        // Get the user's company_id
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (profileError || !profile?.company_id) {
            return NextResponse.json(
                { error: 'Company not found. Please create a company first.' },
                { status: 400 }
            )
        }

        const companyId = profile.company_id
        let content: string = ''
        let sourceType: string = 'document'
        let sourceReference: string = ''

        const contentType = req.headers.get('content-type') || ''

        if (contentType.includes('multipart/form-data')) {
            // ----- File upload flow -----
            const formData = await req.formData()
            const file = formData.get('file') as File | null

            if (!file) {
                return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
            }

            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
            }

            const fileName = file.name.toLowerCase()
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            if (fileName.endsWith('.pdf')) {
                try {
                    console.log('[Upload] Parsing PDF:', fileName)
                    content = await extractTextFromPDF(buffer)
                    console.log('[Upload] PDF parsed. Text length:', content.length)

                    if (!content || content.trim().length < 10) {
                        return NextResponse.json(
                            { error: 'PDF is empty or contains only images.' },
                            { status: 400 }
                        )
                    }
                } catch (pdfError: any) {
                    console.error('[Upload] PDF parse error:', pdfError)
                    return NextResponse.json(
                        { error: 'Could not parse PDF: ' + pdfError.message },
                        { status: 400 }
                    )
                }
            } else if (fileName.endsWith('.txt')) {
                content = buffer.toString('utf-8')
            } else {
                return NextResponse.json(
                    { error: 'Only PDF and TXT files are supported.' },
                    { status: 400 }
                )
            }

            sourceReference = file.name
            sourceType = 'document'

            if (!content || !content.trim()) {
                return NextResponse.json(
                    { error: 'Could not extract text from file.' },
                    { status: 400 }
                )
            }
        } else {
            // ----- Manual text entry flow -----
            const body = await req.json()
            content = body.content || ''
            sourceType = body.sourceType || 'manual'
            sourceReference = body.sourceReference || body.title || 'manual_entry'

            if (!content.trim()) {
                return NextResponse.json({ error: 'Content is required' }, { status: 400 })
            }
        }

        // 🧠 STEP 1: Extract entities with AI
        console.log('[Upload] Extracting entities with AI...')
        const entities = await extractEntities(content)
        console.log('[Upload] Entities extracted:', entities)

        // STEP 2: Save the knowledge item
        const { data, error } = await supabase
            .from('employee_knowledge')
            .insert({
                employee_id: userId,
                company_id: companyId,
                content: content,
                source_type: sourceType,
                source_reference: sourceReference,
                metadata: {
                    source: sourceType,
                    file_name: sourceReference,
                    entities: entities, // Save entities here too
                },
            })
            .select()
            .single()

        if (error) {
            console.error('[Upload] DB Error:', error)
            return NextResponse.json(
                { error: 'Failed to save to database', details: error.message },
                { status: 500 }
            )
        }

        // STEP 3: Save entities to a separate table (for fast graph queries)
        const entitiesToInsert: Array<{
            knowledge_id: string
            company_id: string
            entity_type: string
            entity_value: string
        }> = []

        entities.people?.forEach((person: string) => {
            entitiesToInsert.push({
                knowledge_id: data.id,
                company_id: companyId,
                entity_type: 'person',
                entity_value: person,
            })
        })

        entities.organizations?.forEach((org: string) => {
            entitiesToInsert.push({
                knowledge_id: data.id,
                company_id: companyId,
                entity_type: 'organization',
                entity_value: org,
            })
        })

        entities.topics?.forEach((topic: string) => {
            entitiesToInsert.push({
                knowledge_id: data.id,
                company_id: companyId,
                entity_type: 'topic',
                entity_value: topic,
            })
        })

        entities.dates?.forEach((date: string) => {
            entitiesToInsert.push({
                knowledge_id: data.id,
                company_id: companyId,
                entity_type: 'date',
                entity_value: date,
            })
        })

        entities.action_items?.forEach((item: string) => {
            entitiesToInsert.push({
                knowledge_id: data.id,
                company_id: companyId,
                entity_type: 'action_item',
                entity_value: item,
            })
        })

        if (entitiesToInsert.length > 0) {
            const { error: entitiesError } = await supabase
                .from('knowledge_entities')
                .insert(entitiesToInsert)

            if (entitiesError) {
                console.error('[Upload] Entities save error:', entitiesError)
            } else {
                console.log(`[Upload] Saved ${entitiesToInsert.length} entities`)
            }
        }

        return NextResponse.json(
            {
                success: true,
                data,
                entities: entities,
                entitiesCount: entitiesToInsert.length,
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('[Upload] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// ---------- GET: Fetch knowledge items with their entities ----------

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = getSupabase()
        if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

        // Get the user's company_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (!profile?.company_id) {
            return NextResponse.json({ success: true, data: [] })
        }

        const { data, error } = await supabase
            .from('employee_knowledge')
            .select('*')
            .eq('company_id', profile.company_id)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Fetch the entities for each knowledge item
        const itemsWithEntities = await Promise.all(
            (data || []).map(async (item) => {
                const { data: entities } = await supabase
                    .from('knowledge_entities')
                    .select('*')
                    .eq('knowledge_id', item.id)

                return { ...item, entities: entities || [] }
            })
        )

        return NextResponse.json({ success: true, data: itemsWithEntities })
    } catch (err: any) {
        console.error('[Knowledge GET] Error:', err)
        return NextResponse.json({ error: 'Failed to fetch knowledge' }, { status: 500 })
    }
}
