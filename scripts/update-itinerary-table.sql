-- Update database schema to add itineraries table
-- Run this script in your Supabase SQL Editor

-- Create itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manual', 'ai')),
  destination TEXT NOT NULL,
  duration TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  budget TEXT NOT NULL,
  trip_type TEXT NOT NULL,
  data JSONB NOT NULL, -- For manual: selectedDestinations array, for AI: aiItinerary text
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_type ON itineraries(type);
CREATE INDEX IF NOT EXISTS idx_itineraries_destination ON itineraries(destination);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)  
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for itineraries
CREATE POLICY "Users can view own itineraries" ON itineraries
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own itineraries" ON itineraries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own itineraries" ON itineraries
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own itineraries" ON itineraries
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Add comment for table documentation
COMMENT ON TABLE itineraries IS 'Stores user itineraries with manual or AI-generated travel plans';
COMMENT ON COLUMN itineraries.data IS 'JSONB field: for manual type contains selectedDestinations array, for AI type contains aiItinerary text';
COMMENT ON COLUMN itineraries.type IS 'Type of itinerary: manual (user-created) or ai (AI-generated)';
COMMENT ON COLUMN itineraries.interests IS 'Array of interest categories for the trip';
COMMENT ON COLUMN itineraries.budget IS 'Budget category: budget, medium, or luxury'; 