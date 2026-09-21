export default function PrivacyPage() {
    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-8">
                Privacy Policy
            </h1>
            <p className="text-muted text-sm mb-12">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-brown max-w-none space-y-8">
                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">1. Introduction</h2>
                    <p className="text-brown/80 leading-relaxed">
                        VEQ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our knowledge continuity platform.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">2. Information We Collect</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-mono text-sm font-semibold text-brown mb-2">Personal Information:</h3>
                            <ul className="list-disc list-inside text-brown/80 space-y-1 ml-4">
                                <li>Name, email address, and job title</li>
                                <li>Slack user ID and workspace information</li>
                                <li>Department and role details</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-mono text-sm font-semibold text-brown mb-2">Knowledge Data:</h3>
                            <ul className="list-disc list-inside text-brown/80 space-y-1 ml-4">
                                <li>Brain Maps and micro-task responses</li>
                                <li>Q&A conversations and handover content</li>
                                <li>Slack messages (when explicitly authorized)</li>
                                <li>Project documentation and workflows</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">3. How We Use Your Information</h2>
                    <ul className="list-disc list-inside text-brown/80 space-y-2 ml-4">
                        <li>To create and maintain your Knowledge Continuity profile</li>
                        <li>To generate AI-powered Brain Maps and insights</li>
                        <li>To facilitate knowledge transfer between team members</li>
                        <li>To provide Slack integration and Copilot features</li>
                        <li>To send important updates about your handover tasks</li>
                        <li>To improve our AI models and service quality</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">4. Data Security</h2>
                    <p className="text-brown/80 leading-relaxed">
                        We use industry-standard security measures including:
                    </p>
                    <ul className="list-disc list-inside text-brown/80 space-y-1 ml-4 mt-2">
                        <li>End-to-end encryption for sensitive data</li>
                        <li>Secure Supabase database with Row Level Security</li>
                        <li>Encrypted Slack API communications</li>
                        <li>Regular security audits and updates</li>
                        <li>Locked Vault feature for departed employees</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">5. AI and Data Processing</h2>
                    <p className="text-brown/80 leading-relaxed">
                        VEQ uses OpenAI's GPT-4 to generate Brain Maps and provide AI-powered insights. Your data is processed securely and is not used to train OpenAI's base models. We maintain full control over your institutional knowledge.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">6. Your Rights</h2>
                    <ul className="list-disc list-inside text-brown/80 space-y-2 ml-4">
                        <li>Access your personal data and knowledge contributions</li>
                        <li>Request correction or deletion of your information</li>
                        <li>Export your Brain Map and contributions</li>
                        <li>Revoke Slack permissions at any time</li>
                        <li>Opt-out of AI processing features</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">7. Contact Us</h2>
                    <p className="text-brown/80 leading-relaxed">
                        If you have questions about this Privacy Policy, please contact us at:{' '}
                        <a href="mailto:privacy@veq.app" className="text-brown underline hover:text-gold">
                            privacy@veq.app
                        </a>
                    </p>
                </section>
            </div>
        </section>
    )
}