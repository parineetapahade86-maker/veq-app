-- ============================================
-- FINAL RLS SETUP - SERVICE ROLE ONLY ACCESS
-- ============================================

-- STEP 1: Drop all old auth.uid()-based policies (not needed with Clerk + service role)
DROP POLICY IF EXISTS "Users can view their own activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Users can insert their own activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Users can view their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can view their own knowledge items" ON public.knowledge_items;
DROP POLICY IF EXISTS "Users can insert their own knowledge items" ON public.knowledge_items;
DROP POLICY IF EXISTS "Users can update their own knowledge items" ON public.knowledge_items;
DROP POLICY IF EXISTS "Users can delete their own knowledge items" ON public.knowledge_items;
DROP POLICY IF EXISTS "Users can view their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can insert their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can update their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.user_integrations;

-- STEP 2: Enable RLS on every table (with zero policies = deny-all for anon/authenticated)
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- That's it. No CREATE POLICY needed.
-- Your Next.js backend uses the SERVICE ROLE KEY, which bypasses RLS entirely
-- by design — so it keeps working exactly as before.
-- Any request using the anon/public key (which you don't use) would now be
-- blocked completely, since RLS is on and there are zero policies allowing access.