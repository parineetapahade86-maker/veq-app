import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

//  THE VEQ MANIFESTO METADATA
export const metadata: Metadata = {
  // SEO Title: Category + Core Tagline
  title: "VEQ — The Knowledge Continuity Platform | Knowledge that stays.",

  // The Golden Manifesto Description
  description:
    "Knowledge Management is for files. Knowledge Continuity is for people. VEQ is the world's first Continuity Engine that captures the 'how' and 'why' of your work, preserving tribal knowledge so it never walks out the door.",

  // Keywords to own the new category in search engines
  keywords: [
    "Knowledge Continuity",
    "Knowledge Continuity Platform",
    "Tribal Knowledge",
    "Employee Offboarding",
    "Knowledge Transfer",
    "AI Knowledge Base",
    "VEQ",
  ],

  // OpenGraph 
  openGraph: {
    title: "VEQ — Knowledge that stays. Work that continues.",
    description: "Stop managing documents. Start ensuring Knowledge Continuity. VEQ captures the 'how' and 'why' of your work before it walks out the door.",
    type: "website",
    locale: "en_US",
    siteName: "VEQ",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "VEQ — Knowledge that stays. Work that continues.",
    description: "Knowledge Management is for files. Knowledge Continuity is for people.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable} antialiased flex min-h-screen flex-col`}
        >
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}