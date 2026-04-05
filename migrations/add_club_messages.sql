-- Migration: Add Club Messages Table
-- Description: Creates the club_messages table for club chat functionality

-- Create club_messages table
CREATE TABLE IF NOT EXISTS club_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_club_messages_club_id ON club_messages(club_id);
CREATE INDEX IF NOT EXISTS idx_club_messages_user_id ON club_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_club_messages_created_at ON club_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_club_messages_club_created ON club_messages(club_id, created_at DESC);

-- Enable RLS (Row Level Security) for real-time subscriptions
ALTER TABLE club_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read messages from clubs they are members of
CREATE POLICY "Users can read messages from their clubs" ON club_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.club_id = club_messages.club_id
      AND club_members.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only insert messages in clubs they are members of
CREATE POLICY "Users can send messages to their clubs" ON club_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM club_members
      WHERE club_members.club_id = club_id
      AND club_members.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only update their own messages
CREATE POLICY "Users can edit their own messages" ON club_messages
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can delete their own messages, or club owners can delete any message
CREATE POLICY "Users and club owners can delete messages" ON club_messages
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clubs
      WHERE clubs.id = club_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON club_messages TO authenticated;
GRANT SELECT ON club_messages TO anon;
