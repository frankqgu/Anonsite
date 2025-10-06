/*
  # Create polls and poll_votes tables

  1. New Tables
    - `polls`
      - `id` (uuid, primary key) - Unique identifier for poll
      - `question` (text) - Poll question
      - `created_at` (timestamptz) - When poll was created
    
    - `poll_options`
      - `id` (uuid, primary key) - Unique identifier for option
      - `poll_id` (uuid, foreign key) - Reference to polls table
      - `option_text` (text) - Text of the option
      - `votes` (integer) - Vote count for this option
      - `created_at` (timestamptz) - When option was created
    
    - `poll_votes`
      - `id` (uuid, primary key) - Unique identifier for vote
      - `poll_id` (uuid, foreign key) - Reference to polls table
      - `option_id` (uuid, foreign key) - Reference to poll_options table
      - `voter_id` (text) - Anonymous voter identifier (browser fingerprint/localStorage)
      - `created_at` (timestamptz) - When vote was cast

  2. Security
    - Enable RLS on all tables
    - Anyone can read polls and options
    - Anyone can insert votes
    - Prevent duplicate votes per user per poll

  3. Indexes
    - Index on poll_id for faster option lookups
    - Index on voter_id for duplicate vote checking
*/

CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE,
  voter_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, voter_id)
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read polls"
  ON polls
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read poll options"
  ON poll_options
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read poll votes"
  ON poll_votes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert poll votes"
  ON poll_votes
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_voter_id ON poll_votes(voter_id);

INSERT INTO polls (question) VALUES ('What is your favorite feature?')
ON CONFLICT DO NOTHING;

INSERT INTO poll_options (poll_id, option_text)
SELECT id, 'Anonymous posting'
FROM polls
WHERE question = 'What is your favorite feature?'
ON CONFLICT DO NOTHING;

INSERT INTO poll_options (poll_id, option_text)
SELECT id, 'Media uploads'
FROM polls
WHERE question = 'What is your favorite feature?'
ON CONFLICT DO NOTHING;

INSERT INTO poll_options (poll_id, option_text)
SELECT id, 'Multiple boards'
FROM polls
WHERE question = 'What is your favorite feature?'
ON CONFLICT DO NOTHING;

INSERT INTO poll_options (poll_id, option_text)
SELECT id, 'Modern design'
FROM polls
WHERE question = 'What is your favorite feature?'
ON CONFLICT DO NOTHING;
