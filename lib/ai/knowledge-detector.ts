// lib/ai/knowledge-detector.ts
import OpenAI from 'openai';

// 1. Initialize OpenAI client safely with a fallback to prevent build crashes
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-build-prevention",
});

// 2. Define TypeScript interface for strict type checking (No 'any' errors)
export interface KnowledgeCapture {
    isValuable: boolean;
    category: string;
    summary: string;
    keyPoints: string[];
    peopleInvolved: string[];
}

// 3. Main function with proper types and error handling
export async function analyzeAndCaptureKnowledge(
    messageText: string,
    userName: string = 'Unknown User'
): Promise<KnowledgeCapture | null> {
    try {
        const prompt = `
      Analyze the following Slack message and determine if it contains valuable company knowledge.
      
      User: ${userName}
      Message: "${messageText}"
      
      Check for:
      1. Technical solutions or bug fixes
      2. Process explanations or workflows
      3. Important business or technical decisions
      4. How-to instructions or tutorials
      5. System architecture details
      
      You MUST respond ONLY with a valid JSON object in this exact format:
      {
        "isValuable": true,
        "category": "Bug Fix",
        "summary": "A brief 1-2 sentence summary of the knowledge.",
        "keyPoints": ["Point 1", "Point 2"],
        "peopleInvolved": ["${userName}"]
      }
      
      If the message is just casual chat, greetings, or has no lasting value, set "isValuable" to false.
    `;

        // 4. Call OpenAI API with JSON mode enabled
        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Fast and reliable for JSON
            messages: [
                { role: 'system', content: 'You are a strict JSON-only API. Do not output any markdown, code blocks, or text outside the JSON object.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2, // Low temperature for consistent, predictable JSON
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
            console.warn('⚠️ OpenAI returned empty content');
            return null;
        }

        // 5. Safely parse the JSON response
        const parsedData: KnowledgeCapture = JSON.parse(content);

        // 6. Log only if valuable (for your testing)
        if (parsedData.isValuable) {
            console.log('🧠 [VEQ AI] Valuable knowledge captured:');
            console.log('Category:', parsedData.category);
            console.log('Summary:', parsedData.summary);
        }

        return parsedData;

    } catch (error) {
        console.error('❌ [VEQ AI] Error analyzing knowledge:', error);
        return null; // Return null on error so the app doesn't crash
    }
}