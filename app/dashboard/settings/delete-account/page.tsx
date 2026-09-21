import { getSupabase } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default function DeleteAccount() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-red-600">Delete Account</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Warning</h2>
                <p className="mb-4">
                    This action is permanent. All your data will be deleted within 30 days.
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>All tasks and projects</li>
                    <li>AI chat history</li>
                    <li>Integration connections</li>
                    <li>Feedback submissions</li>
                </ul>
            </div>
            <form action={async () => {
                'use server';
                const user = await currentUser();
                if (!user) redirect('/sign-in');

                const supabase = getSupabase();
                if (supabase) {
                    // Delete all user data
                    await supabase.from('tasks').delete().eq('user_id', user.id);
                    await supabase.from('feedback').delete().eq('user_id', user.id);
                }

                redirect('/');
            }}>
                <button
                    type="submit"
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Delete My Account Permanently
                </button>
            </form>
        </div>
    );
}