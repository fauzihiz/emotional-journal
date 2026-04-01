--1. Create Lookup table for emotions(The "What")
CREATE TABLE emotions(
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL,
    weight INTEGER NOT NULL, -- Range 1 to 8
    color TEXT NOT NULL -- Hex color for the heatmap
);

--Seed initial data (Bahasa Indonesia)
INSERT INTO emotions(id, label, weight, color) VALUES
    (1, 'Semangat', 8, '#FFD700'), -- Gold/Yellow
    (2, 'Bahagia', 7, '#32CD32'), -- Lime Green
    (3, 'Tenang', 6, '#87CEEB'), -- Sky Blue
    (4, 'Berani', 5, '#FFA500'), -- Orange
    (5, 'Bosan', 4, '#A9A9A9'), -- Dark Gray
    (6, 'Sedih', 3, '#1E90FF'), -- Dodger Blue
    (7, 'Kecewa', 2, '#800080'), -- Purple
    (8, 'Marah', 1, '#FF4500'); -- Orange Red

--2. Create the Journal Entries table
CREATE TABLE entries(
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    emotion_id INTEGER REFERENCES emotions(id) NOT NULL,
    content TEXT,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc':: text, now())
);

--3. Row Level Security(RLS) - MANDATORY for SaaS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own entries" ON entries FOR INSERT WITH CHECK(auth.uid() = user_id);
CREATE POLICY "Users can view their own entries" ON entries FOR SELECT USING(auth.uid() = user_id);