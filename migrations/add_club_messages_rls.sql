-- Add RLS policies for club_messages table
-- Run this after creating the table

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