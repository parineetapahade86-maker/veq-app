// app/api/analyze-document/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
    try {
        const { text } = await request.json()

        if (!text || text.trim().length < 50) {
            return NextResponse.json({ error: 'Text is too short to analyze' }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
      You are an expert AI Knowledge Extractor. Analyze the following document text and extract:
      1. A concise 2-3 sentence Summary.
      2. Key Decisions made (max 3-4 bullet points).
      3. Action Items (max 3-4 bullet points).
      
      Respond ONLY in valid JSON format:
      {
        "summary": "string",
        "keyDecisions": ["string", "string"],
        "actionItems": ["string", "string"]
      }

      Document Text:
      ${text}
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        let rawText = response.text()

        // Clean up markdown
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()

        const parsedData = JSON.parse(rawText)

        return NextResponse.json(parsedData)
    } catch (error) {
        console.error('Gemini API Error:', error)
        return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 })
    }
}