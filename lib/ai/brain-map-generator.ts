// lib/ai/brain-map-generator.ts
import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase/client';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the structure of our Brain Map
export interface BrainMap {
    key_projects: { name: string; context: string }[];
    core_responsibilities: string;
    unspoken_rules: string;
    critical_contacts: { name: string; role: string; reason: string }[];
}

/**
 * Generates a "Brain Map" for an employee based on their captured knowledge.
 * This is the core of VEQ's "Implicit Knowledge" moat.
 */
export async function generateBrainMap(
    employeeName: string,
    knowledgeSnippets: string[]
): Promise<BrainMap | null> {

    try {
        // 1. Combine all snippets into a single context for the AI
        const rawContext = knowledgeSnippets.join('\n---\n');

        const prompt = `
      You are VEQ, an advanced AI specializing in Knowledge Continuity. 
      Analyze the following raw knowledge snippets and Slack interactions for an employee named "${employeeName}".
      
      RAW DATA:
      """
      ${rawContext}
      """

      Your task is to extract the "Implicit Knowledge" and generate a structured Brain Map. 
      You MUST respond ONLY with a valid JSON object in this exact format:
      {
        "key_projects": [
          { "name": "Project Name", "context": "What ${employeeName} specifically did or knew about it" }
        ],
        "core_responsibilities": "A 2-3 sentence summary of their actual day-to-day impact (not just their job title)",
        "unspoken_rules": "Any hidden context, unwritten rules, or 'gotchas' ${employeeName} followed (e.g., 'Always check with Priya before deploying to prod')",
        "critical_contacts": [
          { "name": "Person's Name", "role": "Their Role", "reason": "Why ${employeeName} relied on them" }
        ]
      }

      If the data is insufficient, infer logically based on standard tech/business contexts, but keep it grounded.
    `;

        // 2. Call OpenAI (GPT-4o for best reasoning)
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a strict JSON-only API. Do not output markdown or text outside the JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3, // Low temp for factual extraction
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        const brainMap: BrainMap = JSON.parse(content);

        // 3. Save the Brain Map to Supabase
        const { data, error } = await supabase
            .from('brain_maps')
            .insert([
                {
                    employee_name: employeeName,
                    key_projects: brainMap.key_projects,
                    core_responsibilities: brainMap.core_responsibilities,
                    unspoken_rules: brainMap.unspoken_rules,
                    critical_contacts: brainMap.critical_contacts,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to save Brain Map:', error);
        } else {
            console.log(`🧠 [VEQ] Brain Map successfully generated and saved for ${employeeName}! ID: ${data.id}`);
        }

        return brainMap;

    } catch (error) {
        console.error('❌ Error generating Brain Map:', error);
        return null;
    }
}