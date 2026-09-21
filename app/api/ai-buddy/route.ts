import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { message } = await request.json()

        // YAHAN GEMINI API YA OPENAI API USE KARNA HAI
        // Abhi ke liye ek simple response de rahe hain

        const response = await getAIResponse(message)

        return NextResponse.json({ reply: response })
    } catch (error) {
        console.error('AI Buddy API Error:', error)
        return NextResponse.json(
            { reply: "I'm having trouble processing your request right now." },
            { status: 500 }
        )
    }
}

async function getAIResponse(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase()

    // Simple keyword-based responses
    if (lowerMessage.includes('task') || lowerMessage.includes('project')) {
        return "Based on your recent work, you have 3 active tasks:\n1. Client proposal for ABC Corp\n2. Website redesign mockups\n3. Team meeting notes from last week\n\nWould you like details on any specific task?"
    }

    if (lowerMessage.includes('document') || lowerMessage.includes('file')) {
        return "You've uploaded 5 documents this month:\n- Q4 Strategy.pdf\n- Client Meeting Notes.docx\n- Product Roadmap.pptx\n- Budget Report.xlsx\n- Team Guidelines.md\n\nWhich one would you like to access?"
    }

    if (lowerMessage.includes('meeting')) {
        return "Your upcoming meetings:\n📅 Tomorrow 10 AM - Product Review\n📅 Friday 2 PM - Client Call with XYZ\n📅 Monday 11 AM - Team Standup\n\nNeed me to prepare anything?"
    }

    if (lowerMessage.includes('knowledge') || lowerMessage.includes('info')) {
        return "I can help you find information from:\n✅ Your documents\n✅ Task history\n✅ Meeting notes\n✅ Team communications\n\nWhat would you like to know?"
    }

    // Default response
    return "I understand you're asking about: \"" + userMessage + "\"\n\nI'm still learning! Try asking about:\n- Your tasks and projects\n- Documents you've uploaded\n- Recent meetings\n- Team knowledge\n\nI'll get smarter as you use me more!"
}