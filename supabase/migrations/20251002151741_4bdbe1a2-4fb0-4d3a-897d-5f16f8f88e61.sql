-- Create user consents table for GDPR/CCPA compliance
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create data requests table (export/deletion)
CREATE TABLE IF NOT EXISTS public.data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'deletion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  data_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create API permissions tracking table
CREATE TABLE IF NOT EXISTS public.api_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  permission_scopes TEXT[] NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email preferences table for CAN-SPAM compliance
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  marketing_emails BOOLEAN DEFAULT false,
  product_updates BOOLEAN DEFAULT false,
  daily_summary BOOLEAN DEFAULT false,
  unsubscribed_all BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_consents
CREATE POLICY "Users can view their own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
  ON public.user_consents FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for data_requests
CREATE POLICY "Users can view their own data requests"
  ON public.data_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data requests"
  ON public.data_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for api_permissions
CREATE POLICY "Users can view their own API permissions"
  ON public.api_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API permissions"
  ON public.api_permissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API permissions"
  ON public.api_permissions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for email_preferences
CREATE POLICY "Users can view their own email preferences"
  ON public.email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences"
  ON public.email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_data_requests_user_id ON public.data_requests(user_id);
CREATE INDEX idx_data_requests_status ON public.data_requests(status);
CREATE INDEX idx_api_permissions_user_id ON public.api_permissions(user_id);
CREATE INDEX idx_email_preferences_user_id ON public.email_preferences(user_id);