-- Drop existing permissive policies
DROP POLICY IF EXISTS "Service role can insert chat logs" ON public.chat_logs;
DROP POLICY IF EXISTS "Service role can update chat logs" ON public.chat_logs;
DROP POLICY IF EXISTS "Allow reading chat logs" ON public.chat_logs;

-- Create restrictive policies - deny all direct access
-- Service role (used by edge functions) bypasses RLS entirely, so it will still work
CREATE POLICY "Deny direct select access"
ON public.chat_logs
FOR SELECT
USING (false);

CREATE POLICY "Deny direct insert access"
ON public.chat_logs
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny direct update access"
ON public.chat_logs
FOR UPDATE
USING (false);