-- Push subscriptions table for Web Push Notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON public.push_subscriptions(created_at);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their own subscription (anonymous parents)
DROP POLICY IF EXISTS "anyone_can_subscribe" ON public.push_subscriptions;
CREATE POLICY "anyone_can_subscribe"
ON public.push_subscriptions
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to delete their own subscription by endpoint
DROP POLICY IF EXISTS "anyone_can_unsubscribe" ON public.push_subscriptions;
CREATE POLICY "anyone_can_unsubscribe"
ON public.push_subscriptions
FOR DELETE
TO public
USING (true);

-- Allow anyone to update their subscription (re-subscribe)
DROP POLICY IF EXISTS "anyone_can_update_subscription" ON public.push_subscriptions;
CREATE POLICY "anyone_can_update_subscription"
ON public.push_subscriptions
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow authenticated (admin) to read all subscriptions
DROP POLICY IF EXISTS "admin_can_read_subscriptions" ON public.push_subscriptions;
CREATE POLICY "admin_can_read_subscriptions"
ON public.push_subscriptions
FOR SELECT
TO public
USING (true);
