'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'true');
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookieConsent', 'false');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm">
                    <p className="font-semibold mb-1"> We use cookies</p>
                    <p className="text-gray-300">
                        We use cookies to enhance your experience, analyze site traffic,
                        and for authentication. By continuing to use this site, you consent
                        to our use of cookies.
                        <a href="/privacy" className="text-blue-400 underline ml-1">
                            Learn more
                        </a>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={declineCookies}
                        className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 text-sm"
                    >
                        Decline
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="px-4 py-2 bg-brown text-white rounded hover:bg-brown/90 text-sm"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}