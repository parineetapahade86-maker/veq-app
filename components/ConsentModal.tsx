// components/ConsentModal.tsx
'use client';

interface ConsentModalProps {
    integrationName: string;
    onAccept: () => void;
    onDecline: () => void;
}

export default function ConsentModal({ integrationName, onAccept, onDecline }: ConsentModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-modal-title"
            onClick={onDecline} // backdrop click = decline
        >
            <div
                className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl"
                onClick={(e) => e.stopPropagation()} // prevent backdrop click from closing when clicking inside
            >
                {/* Close Button */}
                <button
                    onClick={onDecline}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <h2 id="consent-modal-title" className="text-2xl font-bold text-brown mb-4">
                    Connect {integrationName}?
                </h2>

                <p className="text-gray-600 mb-6">
                    To provide AI-powered insights, VEQ needs access to your {integrationName} data.
                    Here is exactly what we do:
                </p>

                <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-sm text-gray-700">We only read data necessary for your dashboard (tasks, messages, meetings).</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-sm text-gray-700">Your data is encrypted and stored securely in Supabase.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-sm text-gray-700">We NEVER share your data with third parties or use it for training.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-red-500 font-bold">✕</span>
                        <span className="text-sm text-gray-700">We do NOT access your private DMs or personal files.</span>
                    </li>
                </ul>

                <div className="flex gap-4">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 px-4 py-3 bg-brown text-white rounded-lg hover:bg-brown/90 transition"
                    >
                        I Understand, Connect {integrationName}
                    </button>
                </div>
            </div>
        </div>
    );
}