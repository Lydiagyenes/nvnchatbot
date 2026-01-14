-- Create table for chat logs
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to insert (edge functions use service role)
CREATE POLICY "Service role can insert chat logs"
ON public.chat_logs
FOR INSERT
WITH CHECK (true);

-- Create policy for service role to update (for bot response)
CREATE POLICY "Service role can update chat logs"
ON public.chat_logs
FOR UPDATE
USING (true);

-- Create policy to allow reading all logs (for monitoring)
CREATE POLICY "Allow reading chat logs"
ON public.chat_logs
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_chat_logs_created_at ON public.chat_logs(created_at DESC);
CREATE INDEX idx_chat_logs_session_id ON public.chat_logs(session_id);