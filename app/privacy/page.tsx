export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-sm text-gray-600 mb-8">
                Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Data We Collect</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Data:</strong> Name, email (via Clerk authentication)</li>
                    <li><strong>Work Data:</strong> Tasks, meetings, documents you connect via integrations</li>
                    <li><strong>Usage Data:</strong> How you use VEQ features</li>
                    <li><strong>AI Data:</strong> Queries you send to AI Guide (processed via Gemini API)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. How We Store Your Data</h2>
                <p>All data is stored securely in Supabase (PostgreSQL database) with encryption at rest.
                    We do not sell your data to third parties.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Third-Party Services</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Slack, Google, Notion, Jira, Zoom, Asana, Zendesk:</strong> We only access data you explicitly authorize via OAuth</li>
                    <li><strong>Google Gemini API:</strong> Used for AI features. Your queries are processed per Google&apos;s terms</li>
                    <li><strong>Clerk:</strong> Handles authentication per their privacy policy</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Your Rights (DPDP Act 2023 & GDPR)</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> You can request a copy of all your data</li>
                    <li><strong>Export:</strong> Download all your data in JSON format</li>
                    <li><strong>Delete:</strong> Request complete account deletion</li>
                    <li><strong>Consent Withdrawal:</strong> Revoke integration access anytime</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
                <p>We retain your data as long as your account is active. After deletion, data is removed within 30 days.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
                <p>For privacy concerns: <a href="mailto:parineetapahade86@gmail.com" className="text-blue-600 underline">parineetapahade86@gmail.com</a></p>
            </section>
        </div>
    );
}