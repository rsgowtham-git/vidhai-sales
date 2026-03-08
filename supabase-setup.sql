-- Vidhai Sales Intelligence - Supabase Setup
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'viewer',
  allowed_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case Studies Library
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  industry TEXT NOT NULL,
  engagement_types TEXT[] NOT NULL,
  summary TEXT NOT NULL,
  outcome TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Decks History
CREATE TABLE IF NOT EXISTS public.generated_decks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  industry TEXT,
  engagement_types TEXT[],
  deck_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Pitches History
CREATE TABLE IF NOT EXISTS public.generated_pitches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  pitch_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_pitches ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own decks" ON public.generated_decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON public.generated_decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own pitches" ON public.generated_pitches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pitches" ON public.generated_pitches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Everyone can view case studies
CREATE POLICY "Authenticated users view case studies" ON public.case_studies
  FOR SELECT TO authenticated USING (true);

-- Seed with sample case studies
INSERT INTO public.case_studies (title, company, industry, engagement_types, summary, outcome) VALUES
('Harley-Davidson CAD Transformation', 'Harley-Davidson', 'Automotive', ARRAY['CAD Migration', 'Product Engineering'], 'Migrated from legacy CAD to modern parametric system for motorcycle design', '60% faster design cycles, 40% reduction in manual rework'),
('Thor Industries Automation', 'Thor Industries', 'Transportation', ARRAY['Product Engineering', 'Automation'], 'Implemented automated design systems for RV manufacturing customization', '$2M annual savings, 200 engineering hours/month saved'),
('ITW Plant Engineering', 'ITW', 'Industrial', ARRAY['Plant Engineering', 'Automation'], 'Designed and deployed automated assembly line for industrial tools', '35% throughput improvement, 99.2% uptime'),
('Cardinal Health Vision Systems', 'Cardinal Health', 'Healthcare', ARRAY['Automation', 'Vision Inspection'], 'Deployed computer vision quality control for medical device packaging', 'Zero defects detected in 6 months, 50% faster inspection'),
('Fluidra CAD Standardization', 'Fluidra', 'Industrial', ARRAY['CAD Migration', 'Product Engineering'], 'Standardized CAD platform across 12 global facilities for pool equipment', 'Unified design repository, 28% faster time-to-market');

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant admin access to your email (REPLACE WITH YOUR EMAIL)
-- First create user in Supabase Auth UI, then run:
-- UPDATE public.user_profiles 
-- SET allowed_access = true, role = 'admin'
-- WHERE email = 'your-email@example.com';