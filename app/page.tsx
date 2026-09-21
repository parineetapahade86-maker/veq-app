import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhatIsVeq from "@/components/WhatIsVeq";
import WhyVeq from "@/components/WhyVeq";
import HowItWorks from "@/components/HowItWorks";
import HowToUse from "@/components/HowToUse";
import FinalCta from "@/components/FinalCta";
import FloatingFeedback from "@/components/FloatingFeedback";

export default function Home() {
    return (
        <div className="min-h-screen bg-cream">
            <Navbar />
            <main>
                <Hero />
                <WhatIsVeq />
                <WhyVeq />
                <HowItWorks />
                <HowToUse />
                <FinalCta />
            </main>
            <FloatingFeedback />
        </div>
    );
}