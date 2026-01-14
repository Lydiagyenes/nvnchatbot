-- Add restrictive DELETE policy for chat_logs
CREATE POLICY "Deny direct delete access"
ON public.chat_logs
FOR DELETE
USING (false);