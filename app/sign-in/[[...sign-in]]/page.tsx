'use client'

import Link from "next/link";
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

export default function SignInPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Supabase client
  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const checkProfile = async () => {
        try {
          const email = user.primaryEmailAddress?.emailAddress;

          if (!email) {
            console.warn('No primary email found');
            return;
          }

          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('email', email)
            .maybeSingle();

          if (error) {
            console.error('Error checking profile:', error);
          }

          // CHANGE: Redirect directly to the Dashboard and skip onboarding!
          router.push('/dashboard');

        } catch (error) {
          console.error('Error:', error);
          router.push('/dashboard');
        }
      };

      checkProfile();
    }
  }, [isLoaded, isSignedIn, user, router, supabase]);

  return (
    <main className="min-h-screen bg-black-rich flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="font-display text-xl tracking-tight text-cream">
              VEQ
            </span>
          </Link>

          <h1 className="font-display text-3xl text-cream italic">
            Welcome back
          </h1>

          <p className="text-muted-deep text-sm mt-2 font-mono">
            sign in to continue the work
          </p>
        </div>

        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-black border border-white/10 shadow-2xl rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-black-rich border border-white/10 text-cream hover:bg-white/5",
              dividerLine: "bg-white/10",
              dividerText: "text-muted-deep",
              formFieldLabel: "text-cream/80",
              formFieldInput:
                "bg-black-rich border-white/10 text-cream focus:border-gold",
              formButtonPrimary:
                "bg-gold hover:bg-gold-deep text-black-rich font-medium",
              footerActionLink: "text-gold hover:text-gold-deep",
              identityPreviewText: "text-cream",
              formResendCodeLink: "text-gold",
            },
            variables: {
              colorPrimary: "#C6A15B",
            },
          }}
        />
      </div>
    </main>
  );
}