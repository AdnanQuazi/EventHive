"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import {
  getClubMessages,
  sendClubMessage,
  type MessageWithUser,
} from "@/lib/actions/club-messages";
import { ChatBubble } from "@/components/sections/chat-bubble";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface ClubChatContentProps {
  clubId: string;
  userId: string;
  clubOwnerId: string;
}

export function ClubChatContent({
  clubId,
  userId,
  clubOwnerId,
}: ClubChatContentProps) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    name: string;
    avatar_url: string | null;
  } | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [clubId]);

  // Load current user profile
  useEffect(() => {
    loadCurrentUserProfile();
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`club-messages-${clubId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "club_messages",
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          console.log("Real-time event:", payload.eventType, payload);
          // Reload messages to ensure we have the latest state
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [clubId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const result = await getClubMessages(clubId, 100);
      if (result.error) {
        console.error("Failed to load messages:", result.error);
      } else if (result.data) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUserProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Failed to get current user:", error);
        return;
      }

      setCurrentUserProfile({
        name: user.user_metadata?.name || user.email || "You",
        avatar_url: user.user_metadata?.avatar_url || null,
      });
    } catch (error) {
      console.error("Error loading current user profile:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    setIsSending(true);
    const messageToSend = newMessage;
    setNewMessage("");

    try {
      const result = await sendClubMessage(clubId, messageToSend);
      if (result.error) {
        toast.error(result.error);
        setNewMessage(messageToSend); // Restore message on error
      } else {
        toast.success("Message sent");
        // Optimistically add the message to the local state
        if (result.data) {
          const optimisticMessage: MessageWithUser = {
            ...result.data,
            user_profile: currentUserProfile ? {
              name: currentUserProfile.name,
              avatar_url: currentUserProfile.avatar_url,
            } : undefined,
          };
          setMessages(prev => [...prev, optimisticMessage]);
        }

        // Fallback: reload messages after a short delay in case real-time doesn't work
        setTimeout(() => {
          loadMessages();
        }, 2000);
      }
    } catch (error) {
      toast.error("Failed to send message");
      setNewMessage(messageToSend); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full bg-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Club Chat</h3>
          <p className="text-sm text-gray-500">
            {messages.length} messages
          </p>
        </div>

        {/* Messages Area */}
        <ScrollArea
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  clubId={clubId}
                  isOwnMessage={message.user_id === userId}
                  isClubOwner={userId === clubOwnerId}
                  currentUserProfile={currentUserProfile}
                  onMessageUpdated={loadMessages}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              className="resize-none"
              rows={2}
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
              className="h-auto px-4 bg-blue-500 hover:bg-blue-600"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Only club members can see and participate in this chat
          </p>
        </div>
      </div>
    </Card>
  );
}
