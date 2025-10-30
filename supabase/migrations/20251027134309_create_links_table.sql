/*
  # Create links table for important links and materials

  1. New Tables
    - `links`
      - `id` (uuid, primary key) - Unique identifier for each link
      - `title` (text) - Link title/name
      - `url` (text) - Link URL
      - `category` (text) - Category: 'important' or 'materials'
      - `order_index` (integer) - Display order within category
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on `links` table
    - Add policy for public read access (anyone can view links)
    - Add policies for insert, update, delete (admin check in application layer)
*/

CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  category text NOT NULL CHECK (category IN ('important', 'materials')),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read links (public access)
CREATE POLICY "Public can view links"
  ON links
  FOR SELECT
  USING (true);

-- Policy: Allow insert for all (admin check will be in application layer)
CREATE POLICY "Allow insert links"
  ON links
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow update for all (admin check will be in application layer)
CREATE POLICY "Allow update links"
  ON links
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow delete for all (admin check will be in application layer)
CREATE POLICY "Allow delete links"
  ON links
  FOR DELETE
  USING (true);

-- Create index for category filtering and ordering
CREATE INDEX IF NOT EXISTS idx_links_category_order ON links(category, order_index);

-- Create updated_at trigger
CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
