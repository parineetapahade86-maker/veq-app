// lib/gap-scanner.ts

// Standard Business Pillars (The AI's Checklist)
export const BUSINESS_PILLARS = [
    { id: 'sales', name: 'Sales & Marketing', keywords: ['sales', 'marketing', 'lead', 'client', 'crm', 'pitch', 'revenue'] },
    { id: 'hr', name: 'HR & Onboarding', keywords: ['hr', 'onboarding', 'hiring', 'employee', 'policy', 'leave', 'culture'] },
    { id: 'tech', name: 'Tech & Engineering', keywords: ['tech', 'code', 'api', 'server', 'database', 'deployment', 'architecture'] },
    { id: 'finance', name: 'Finance & Legal', keywords: ['finance', 'legal', 'invoice', 'tax', 'contract', 'billing', 'compliance'] },
    { id: 'ops', name: 'Operations & SOPs', keywords: ['sop', 'operation', 'process', 'workflow', 'standard', 'procedure'] },
    { id: 'support', name: 'Customer Support', keywords: ['support', 'ticket', 'customer', 'help', 'faq', 'issue'] }
];

interface KnowledgeItem {
    source_reference: string;
    content: string;
    metadata?: any;
}

export function detectKnowledgeGaps(items: KnowledgeItem[]) {
    const filledPillars = new Set<string>();

    // Scan existing documents against keywords
    items.forEach(item => {
        const text = `${item.source_reference} ${item.content} ${item.metadata?.tags?.join(' ') || ''}`.toLowerCase();

        BUSINESS_PILLARS.forEach(pillar => {
            if (pillar.keywords.some(keyword => text.includes(keyword))) {
                filledPillars.add(pillar.id);
            }
        });
    });

    // Return only the missing pillars
    return BUSINESS_PILLARS.filter(pillar => !filledPillars.has(pillar.id));
}