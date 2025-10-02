-- Create table to store user email connections
CREATE TABLE IF NOT EXISTS public.email_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_address TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'gmail',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store fetched emails
CREATE TABLE IF NOT EXISTS public.user_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_id TEXT NOT NULL,
  thread_id TEXT,
  subject TEXT,
  sender_name TEXT,
  sender_email TEXT,
  body_snippet TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal',
  labels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_connections
CREATE POLICY "Users can view their own email connections"
  ON public.email_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email connections"
  ON public.email_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email connections"
  ON public.email_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email connections"
  ON public.email_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_emails
CREATE POLICY "Users can view their own emails"
  ON public.user_emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails"
  ON public.user_emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails"
  ON public.user_emails FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails"
  ON public.user_emails FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_email_connections_user_id ON public.email_connections(user_id);
CREATE INDEX idx_user_emails_user_id ON public.user_emails(user_id);
CREATE INDEX idx_user_emails_received_at ON public.user_emails(received_at DESC);