# Club Chat System Implementation Guide

## Overview
This document explains the new club chatting system added to EventHive. Club members can now communicate in real-time within their clubs.

## Features
- ✅ Real-time messaging between club members
- ✅ Edit messages (only your own)
- ✅ Delete messages (your own or if you're club owner)
- ✅ Message timestamps and "edited" indicator
- ✅ Member avatars and names
- ✅ Auto-scroll to latest messages
- ✅ Keyboard shortcut (Enter to send, Shift+Enter for new line)
- ✅ Real-time updates via Supabase subscriptions

## Setup Instructions

### 1. Database Migration
Run the SQL migration in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the contents from `migrations/add_club_messages.sql`
4. Execute the query

**If you already created the table manually, run the RLS policies:**

1. Copy the contents from `migrations/add_club_messages_rls.sql`
2. Execute this query to add the security policies

This will create:
- `club_messages` table with proper structure
- RLS (Row Level Security) policies for data access
- Indices for performance optimization
- Relationships to `clubs` and `auth.users` tables

### 2. File Structure
New files added:

```
lib/
  actions/
    club-messages.ts          # Server actions for chat operations
  types/
    database.ts               # Updated with club_messages table

components/
  sections/
    chat-bubble.tsx           # Individual message component
    club-chat-content.tsx     # Chat container with input

app/
  clubs/
    [id]/
      page.tsx               # Updated to include chat

migrations/
  add_club_messages.sql      # Database migration script
```

## API/Server Actions

### Available Actions in `lib/actions/club-messages.ts`

#### `sendClubMessage(clubId: string, content: string)`
- Sends a message to a club
- Only works for club members
- Returns the created message

#### `getClubMessages(clubId: string, limit?: number, offset?: number)`
- Retrieves messages from a club (default 50, paginated)
- Only accessible to club members
- Returns messages with user info included

#### `deleteClubMessage(messageId: string, clubId: string)`
- Deletes a message
- Only message sender or club owner can delete
- Permanently removes message

#### `editClubMessage(messageId: string, clubId: string, newContent: string)`
- Edits a message
- Only message sender can edit
- Marks message as "edited" with timestamp

## Components

### ClubChatContent
Main chat component that handles:
- Loading initial messages
- Real-time message subscriptions via Supabase
- Displaying message list
- Input field with validation
- Auto-scrolling to latest message

**Props:**
- `clubId: string` - The club ID
- `userId: string` - Current user ID
- `clubOwnerId: string` - Club owner ID (for deletion permissions)

### ChatBubble
Individual message component that displays:
- Message content
- Sender info (avatar, name)
- Timestamp
- Edit/Delete buttons on hover
- Edit mode with save/cancel options

**Props:**
- `message: MessageWithUser` - The message object with user info
- `clubId: string` - Club ID
- `isOwnMessage: boolean` - Whether it's the current user's message
- `isClubOwner: boolean` - Whether current user is club owner
- `onMessageUpdated?: () => void` - Callback when message is updated/deleted

## Security

### Row Level Security (RLS)
- Users can only see/send messages in clubs they're members of
- Users can only edit/delete their own messages
- Club owners can delete any message in their club
- All permissions enforced at database level

### Verification
- Club membership is verified before each operation
- User authentication is required
- Policies are enforced on the database level

## Usage

## Usage

### In the Club Management Page
The chat appears on the club management page with different views:

- **Club Owners:** Full management interface + chat (2-column layout)
- **Club Members:** Club information + member list + chat (single column layout)

Both owners and members can access the club page from their profile, but with different permissions and views.

### Real-Time Updates
Messages update in real-time as:
- New messages are sent
- Messages are edited
- Messages are deleted

This is powered by Supabase's real-time subscriptions.

## Keyboard Shortcuts

In the message input field:
- **Enter** - Send message
- **Shift + Enter** - Add new line

## Error Handling

The system handles:
- User not authenticated
- User not a club member
- Network errors
- Invalid message content (empty)
- Invalid permissions (edit/delete)

All errors are displayed as toast notifications.

## Performance Considerations

1. **Pagination**: Messages are loaded in batches of 50 (customizable)
2. **Indexing**: Created indices on frequently queried columns
3. **Real-time**: Minimal payload updates only changed data
4. **Auto-scroll**: Efficient scroll handling with ref
5. **Optimistic Updates**: UI updates immediately, syncs with server

## Future Enhancements

Potential improvements:
- Message reactions (👍, ❤️, etc.)
- Typing indicators
- Message search within club
- Pinned messages
- Message attachments/images
- Message threads/replies
- Message history export
- Voice messages

## Troubleshooting

### Messages not loading?
1. Verify you're a club member
2. Check browser console for errors
3. Confirm database migration was applied
4. Check Supabase connection in `.env`

### Real-time updates not working?
1. Verify Supabase anon key is correct in `.env`
2. Check browser console for websocket errors
3. Ensure RLS policies are properly applied
4. Try refreshing the page

### Can't delete/edit messages?
1. Verify message is yours or you're club owner
2. Check database RLS policies
3. Verify user authentication

## Testing

To test the chat system:

1. Create a club with an owner account
2. Add members to the club
3. Navigate to the club management page
4. Send messages as the owner
5. Switch to a member account and verify:
   - Can see messages
   - Can send messages
   - Cannot edit/delete others' messages
   - Member messages appear in real-time
