/*
  # Create sessions table for training schedule

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key) - Unique identifier for each session
      - `title` (text) - Session topic/theme
      - `type` (text) - Session type: 'theory' or 'practical'
      - `date_start` (timestamptz) - Session start date and time
      - `date_end` (timestamptz, nullable) - Session end date (for multi-day sessions)
      - `teachers` (text) - Names of instructors/teachers
      - `folder_link` (text, nullable) - Link to materials folder
      - `notes` (text, nullable) - Additional notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on `sessions` table
    - Add policy for public read access (anyone can view schedule)
    - Add policy for authenticated admin write access (will be handled via password check in app)
*/

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('theory', 'practical')),
  date_start timestamptz NOT NULL,
  date_end timestamptz,
  teachers text NOT NULL DEFAULT '',
  folder_link text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read sessions (public schedule)
CREATE POLICY "Public can view sessions"
  ON sessions
  FOR SELECT
  USING (true);

-- Policy: Allow insert for all (admin check will be in application layer)
CREATE POLICY "Allow insert sessions"
  ON sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow update for all (admin check will be in application layer)
CREATE POLICY "Allow update sessions"
  ON sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow delete for all (admin check will be in application layer)
CREATE POLICY "Allow delete sessions"
  ON sessions
  FOR DELETE
  USING (true);

-- Create index for date filtering
CREATE INDEX IF NOT EXISTS idx_sessions_date_start ON sessions(date_start);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
