// lib/confetti.ts
import confetti from 'canvas-confetti';

export const triggerVEQConfetti = () => {
    const brandColors = ['#C6A15B', '#3A2418', '#F4EDE1', '#806B58'];

    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: brandColors,
        disableForReducedMotion: true,
        scalar: 1.2
    });
};