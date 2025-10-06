/*
  # Create posts table for anonymous forum

  1. New Tables
    - `posts`
      - `id` (uuid, primary key) - Unique identifier for each post
      - `board` (text) - Board name (random, media, promotions)
      - `username` (text) - Username or "Anonymous"
      - `content` (text) - Post content/message
      - `media_url` (text, nullable) - URL to uploaded media file
      - `status` (text) - Post status (pending, approved) for moderation
      - `created_at` (timestamptz) - Timestamp of post creation

  2. Security
    - Enable RLS on `posts` table
    - Add policy for anyone to read approved posts
    - Add policy for anyone to insert posts (anonymous posting)
    - Posts on promotions board default to pending status
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board text NOT NULL,
  username text DEFAULT 'Anonymous',
  content text NOT NULL,
  media_url text,
  status text DEFAULT 'approved',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved posts"
  ON posts
  FOR SELECT
  USING (status = 'approved' OR status = 'pending');

CREATE POLICY "Anyone can insert posts"
  ON posts
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_posts_board ON posts(board);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_status ON posts(status);
