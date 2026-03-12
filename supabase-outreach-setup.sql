-- Vidhai Sales Intelligence - Outreach Generator Tables
-- Run this in Supabase SQL Editor after the main supabase-setup.sql

-- Generated Outreach History
CREATE TABLE IF NOT EXISTS public.generated_outreach (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  icp_criteria JSONB NOT NULL,
  contacts JSONB NOT NULL,
  contact_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.generated_outreach ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own outreach" ON public.generated_outreach
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outreach" ON public.generated_outreach
  FOR INSERT WITH CHECK (auth.uid() = user_id);