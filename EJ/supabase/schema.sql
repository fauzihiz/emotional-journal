-- 1. Create Lookup table for emotions (The "What")
CREATE TABLE emotions (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL,
    weight INTEGER NOT NULL, -- Range 1 to 12
    color TEXT NOT NULL -- Hex color for the heatmap
);

-- Seed initial data (Bahasa Indonesia - 12 Categories Gradient)
INSERT INTO emotions (id, label, weight, color) VALUES
    (1,  'Marah',    1,  '#EF4444'),
    (2,  'Takut',    2,  '#475569'),
    (3,  'Cemas',    3,  '#8B5CF6'),
    (4,  'Sedih',    4,  '#3B82F6'),
    (5,  'Kecewa',   5,  '#6B21A8'),
    (6,  'Bosan',    6,  '#94A3B8'),
    (7,  'Tenang',   7,  '#2DD4BF'),
    (8,  'Bahagia',  8,  '#4ADE80'),
    (9,  'Syukur',   9,  '#FACC15'),
    (10, 'Berani',   10, '#FB923C'),
    (11, 'Semangat', 11, '#F59E0B'),
    (12, 'Yakin',    12, '#10B981');

-- 2. Create the Journal Entries table
CREATE TABLE entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    emotion_id INTEGER REFERENCES emotions(id) NOT NULL,
    content TEXT,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Row Level Security (RLS)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own entries" ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own entries" ON entries FOR SELECT USING (auth.uid() = user_id);