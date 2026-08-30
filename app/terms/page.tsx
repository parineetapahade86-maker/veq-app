export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-sm text-gray-600 mb-8">
                Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p>By using VEQ, you agree to these terms. If you don't agree, please don't use our service.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Data Ownership</h2>
                <p><strong>Your data belongs to you.</strong> VEQ does not claim ownership of any content,
                    documents, or data you connect through our platform.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. AI Features Disclaimer</h2>
                <p>AI Guide and AI-generated summaries may contain errors. Always verify critical information.
                    VEQ is not liable for decisions made based on AI suggestions.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Employee Monitoring Transparency</h2>
                <p>VEQ captures work patterns (tasks, meetings, documents) to provide insights.
                    Employers using VEQ should inform employees about this data collection as per applicable labor laws.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
                <p>VEQ is provided "as is" without warranties. We are not liable for any indirect,
                    incidental, or consequential damages.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
                <p>You can delete your account anytime. We may terminate accounts that violate these terms.</p>
            </section>
        </div>
    );
}