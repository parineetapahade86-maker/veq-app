"use client";

import { useState } from "react";

export default function FloatingFeedback() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/send-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (data.success) {
                setSent(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSent(false);
                    setName("");
                    setEmail("");
                    setMessage("");
                }, 2500);
            } else {
                alert("Failed to send feedback. Please try again.");
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-brown text-cream px-5 py-3 rounded-full shadow-lg hover:bg-black-rich hover:scale-105 transition-all duration-300 z-40 flex items-center gap-2 font-medium border border-brown/10"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                </svg>
                Feedback
            </button>

            {/* Modal Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Modal Content */}
                    <div
                        className="bg-cream border hairline rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-muted hover:text-brown transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {sent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gold-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="font-display text-2xl text-brown mb-2">Thank You!</h3>
                                <p className="text-muted">Your feedback has been sent to the VEQ team.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h3 className="font-display text-2xl text-brown mb-1">Share your thoughts</h3>
                                    <p className="text-muted text-sm">Help us make VEQ better for everyone.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full px-4 py-2.5 rounded-xl border hairline bg-white focus:outline-none focus:border-gold/50 text-brown placeholder:text-brown/30 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-2.5 rounded-xl border hairline bg-white focus:outline-none focus:border-gold/50 text-brown placeholder:text-brown/30 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">Message *</label>
                                        <textarea
                                            required
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="What do you like? What can we improve?"
                                            rows={4}
                                            className="w-full px-4 py-2.5 rounded-xl border hairline bg-white focus:outline-none focus:border-gold/50 text-brown placeholder:text-brown/30 resize-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-brown text-cream rounded-xl font-medium hover:bg-black-rich transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Feedback
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}