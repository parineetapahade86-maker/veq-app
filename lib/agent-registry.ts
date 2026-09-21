// lib/agent-registry.ts

export type AgentPermission = {
    read: boolean;
    write: boolean;
    approve: boolean;
    send: boolean;
    delete: boolean;
};

export type AgentConfig = {
    id: string;
    name: string;
    description: string;
    permissions: AgentPermission;
    defaultRiskLevel: 'low' | 'medium' | 'high';
    icon: string; // Lucide icon name for future UI
};

// 🔥 THE SINGLE SOURCE OF TRUTH FOR ALL VEQ AGENTS
// Future Marketplace will simply read from or add to this registry.
export const AGENT_REGISTRY: Record<string, AgentConfig> = {
    exit_agent: {
        id: 'exit_agent',
        name: 'Exit Agent',
        description: 'Captures departing employee knowledge, handover checklists, and undocumented workflows.',
        permissions: { read: true, write: true, approve: false, send: false, delete: false },
        defaultRiskLevel: 'medium',
        icon: 'Brain'
    },
    onboarding_agent: {
        id: 'onboarding_agent',
        name: 'Onboarding Agent',
        description: 'Handles new employee setup, IT/HR checklists, and team introductions.',
        permissions: { read: true, write: true, approve: false, send: true, delete: false },
        defaultRiskLevel: 'medium',
        icon: 'UserPlus'
    },
    memory_agent: {
        id: 'memory_agent',
        name: 'Memory Agent',
        description: 'Maintains and retrieves important organizational memory and historical context.',
        permissions: { read: true, write: false, approve: false, send: false, delete: false },
        defaultRiskLevel: 'low',
        icon: 'Database'
    },
    knowledge_agent: {
        id: 'knowledge_agent',
        name: 'Knowledge Agent',
        description: 'Answers general questions about company knowledge, documented SOPs, and policies.',
        permissions: { read: true, write: false, approve: false, send: false, delete: false },
        defaultRiskLevel: 'low',
        icon: 'BookOpen'
    },
    process_agent: {
        id: 'process_agent',
        name: 'Process Agent',
        description: 'Executes standard operating procedures (SOPs) and checks process compliance.',
        permissions: { read: true, write: true, approve: false, send: false, delete: false },
        defaultRiskLevel: 'medium',
        icon: 'Settings'
    },
    manager_agent: {
        id: 'manager_agent',
        name: 'Manager Agent',
        description: 'Provides executive summaries, identifies risks, and approves high-stakes actions.',
        permissions: { read: true, write: false, approve: true, send: true, delete: false },
        defaultRiskLevel: 'high',
        icon: 'Briefcase'
    }
    // 🚀 FUTURE MARKETPLACE: New agents (Sales, HR, Finance) will be added here.
    // They will automatically inherit VEQ's security, audit, and memory systems.
};

// Helper function to get agent config safely
export function getAgentConfig(agentId: string): AgentConfig {
    return AGENT_REGISTRY[agentId] || AGENT_REGISTRY['exit_agent']; // Fallback for safety
}