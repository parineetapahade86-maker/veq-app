import { getSupabase } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ExportData() {
    const user = await currentUser();

    if (!user) redirect('/sign-in');

    const supabase = getSupabase();

    let tasks = null;
    let feedback = null;

    if (supabase) {
        const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id);

        const { data: feedbackData } = await supabase
            .from('feedback')
            .select('*')
            .eq('user_id', user.id);

        tasks = tasksData;
        feedback = feedbackData;
    }

    const exportData = {
        user: { id: user.id, email: user.emailAddresses?.[0]?.emailAddress ?? null },
        tasks,
        feedback,
        exportedAt: new Date().toISOString()
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Export Your Data</h1>
            <p className="mb-6">Download all your data in JSON format.</p>
            <a
                href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`}
                download={`veq-data-export-${Date.now()}.json`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
                Download All My Data
            </a>
        </div>
    );
}
