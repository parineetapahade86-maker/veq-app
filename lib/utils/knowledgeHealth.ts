// lib/utils/knowledgeHealth.ts

export type HealthStatus = 'green' | 'yellow' | 'red';

export interface HealthMetrics {
    tasksCompletedThisWeek: number;
    documentsUploadedThisWeek: number;
    aiBuddyQueriesThisWeek: number;
    daysSinceLastActivity: number;
}

export function calculateKnowledgeHealth(
    metrics: HealthMetrics
): { status: HealthStatus; message: string } {

    // 1. RED: Knowledge Gap (No activity for 7+ days)
    if (metrics.daysSinceLastActivity >= 7) {
        return {
            status: 'red',
            message: 'Knowledge Gap: No recent activity. Let\'s catch up!'
        };
    }

    // 2. GREEN: Fully Synced (Active and contributing)
    if (
        metrics.tasksCompletedThisWeek >= 3 ||
        metrics.documentsUploadedThisWeek >= 2 ||
        metrics.aiBuddyQueriesThisWeek >= 5
    ) {
        return {
            status: 'green',
            message: 'Fully Synced: Great job keeping the team knowledge updated!'
        };
    }

    // 3. YELLOW: Needs Attention (Some activity, but could be better)
    return {
        status: 'yellow',
        message: 'Needs Attention: A few pending updates. Keep the momentum going!'
    };
}