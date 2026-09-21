export default function TermsPage() {
    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-8">
                Terms of Service
            </h1>
            <p className="text-muted text-sm mb-12">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-brown max-w-none space-y-8">
                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">1. Agreement to Terms</h2>
                    <p className="text-brown/80 leading-relaxed">
                        By accessing or using VEQ ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">2. Description of Service</h2>
                    <p className="text-brown/80 leading-relaxed">
                        VEQ is a knowledge continuity platform that helps organizations preserve institutional knowledge through AI-powered Brain Maps, micro-interviews, and seamless handover processes. The Service includes:
                    </p>
                    <ul className="list-disc list-inside text-brown/80 space-y-1 ml-4 mt-2">
                        <li>Knowledge capture and storage</li>
                        <li>AI-generated Brain Maps</li>
                        <li>Slack integration and Copilot</li>
                        <li>Employee handover workflows</li>
                        <li>Q&A and Reverse Handover features</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">3. User Responsibilities</h2>
                    <div className="space-y-4">
                        <p className="text-brown/80 leading-relaxed">
                            As a VEQ user, you agree to:
                        </p>
                        <ul className="list-disc list-inside text-brown/80 space-y-1 ml-4">
                            <li>Provide accurate and truthful information in your knowledge contributions</li>
                            <li>Complete micro-tasks within reasonable timeframes</li>
                            <li>Respect the confidentiality of your organization's data</li>
                            <li>Not share your account credentials with others</li>
                            <li>Notify us immediately of any unauthorized access</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">4. Intellectual Property</h2>
                    <p className="text-brown/80 leading-relaxed">
                        The Service and its original content, features, and functionality are owned by VEQ and are protected by international copyright, trademark, and other intellectual property laws. However, your knowledge contributions remain the property of your organization.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">5. Data Ownership</h2>
                    <p className="text-brown/80 leading-relaxed">
                        Your organization retains full ownership of all knowledge, Brain Maps, and data uploaded to VEQ. We do not claim ownership of your content and will not share it with third parties except as required by law or with your explicit consent.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">6. Limitation of Liability</h2>
                    <p className="text-brown/80 leading-relaxed">
                        VEQ is provided "as is" and "as available" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">7. AI-Generated Content</h2>
                    <p className="text-brown/80 leading-relaxed">
                        VEQ uses AI to generate Brain Maps and insights. While we strive for accuracy, AI-generated content may contain errors. Users should review and verify important information before relying on it for critical business decisions.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">8. Termination</h2>
                    <p className="text-brown/80 leading-relaxed">
                        We may terminate or suspend your access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">9. Governing Law</h2>
                    <p className="text-brown/80 leading-relaxed">
                        These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which VEQ operates, without regard to its conflict of law provisions.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">10. Changes to Terms</h2>
                    <p className="text-brown/80 leading-relaxed">
                        We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-2xl text-brown italic mb-4">11. Contact Information</h2>
                    <p className="text-brown/80 leading-relaxed">
                        For questions about these Terms, please contact us at:{' '}
                        <a href="mailto:legal@veq.app" className="text-brown underline hover:text-gold">
                            legal@veq.app
                        </a>
                    </p>
                </section>
            </div>
        </section>
    )
}