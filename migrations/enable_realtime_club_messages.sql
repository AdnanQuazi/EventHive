-- Enable Real-time for club_messages table
-- This migration enables REPLICA IDENTITY for the club_messages table
-- which is required for Supabase real-time subscriptions to work

-- Set REPLICA IDENTITY to FULL to ensure all columns are included in replication
ALTER TABLE club_messages REPLICA IDENTITY FULL;

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_club_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_club_messages_updated_at_trigger ON club_messages;

-- Create trigger
CREATE TRIGGER update_club_messages_updated_at_trigger
BEFORE UPDATE ON club_messages
FOR EACH ROW
EXECUTE FUNCTION update_club_messages_updated_at();
