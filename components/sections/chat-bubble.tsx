"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Edit2, X, MoreHorizontal } from "lucide-react";
import {
  deleteClubMessage,
  editClubMessage,
  type MessageWithUser,
} from "@/lib/actions/club-messages";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ChatBubbleProps {
  message: MessageWithUser;
  clubId: string;
  isOwnMessage: boolean;
  isClubOwner: boolean;
  currentUserProfile?: {
    name: string;
    avatar_url: string | null;
  };
}

export function ChatBubble({
  message,
  clubId,
  isOwnMessage,
  isClubOwner,
  currentUserProfile,
}: ChatBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isDeletingOrEditing, setIsDeletingOrEditing] = useState(false);

  const canDelete = isOwnMessage || isClubOwner;
  const canEdit = isOwnMessage;

  const handleDelete = async () => {
    setIsDeletingOrEditing(true);
    try {
      const result = await deleteClubMessage(message.id, clubId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Message deleted");
        // Real-time subscription will handle the deletion
      }
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeletingOrEditing(false);
    }
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setIsDeletingOrEditing(true);
    try {
      const result = await editClubMessage(
        message.id,
        clubId,
        editedContent
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Message updated");
        setIsEditing(false);
        // Real-time subscription will handle the update
      }
    } catch (error) {
      toast.error("Failed to edit message");
    } finally {
      setIsDeletingOrEditing(false);
    }
  };

  const displayName = isOwnMessage
    ? "You"
    : (message.user_profile?.name || "Member");
  const userInitials = isOwnMessage
    ? (currentUserProfile?.name?.charAt(0)?.toUpperCase() || "Y")
    : (message.user_profile?.name?.charAt(0)?.toUpperCase() || "M");
  const avatarUrl = isOwnMessage
    ? currentUserProfile?.avatar_url
    : message.user_profile?.avatar_url;

  return (
    <div
      className={`flex gap-3 mb-4 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${ isOwnMessage ? "items-end" : "items-start" }`}>
        {!isOwnMessage && (
          <span className="text-xs font-semibold text-gray-500 mb-1">
            {displayName}
          </span>
        )}

        {isEditing ? (
          <div className="flex gap-2 w-full max-w-md">
            <div className="flex-1">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Edit message..."
                className="resize-none text-sm"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={isDeletingOrEditing}
                className="h-8 px-2 bg-blue-500 hover:bg-blue-600"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(message.content);
                }}
                disabled={isDeletingOrEditing}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div
              className={`px-3 py-2 rounded-lg max-w-md break-words ${
                isOwnMessage
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.is_edited && (
                <span className="text-xs opacity-75 block mt-1">
                  (edited)
                </span>
              )}
            </div>

            <span
              className={`text-xs text-gray-500 mt-1 ${
                isOwnMessage ? "text-right" : "text-left"
              }`}
            >
              {format(new Date(message.created_at), "HH:mm")}
            </span>

            {(canEdit || canDelete) && (
              <div className={`absolute top-0 ${
                isOwnMessage ? "left-0" : "right-0"
              } opacity-0 group-hover:opacity-100 transition-opacity`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwnMessage ? "start" : "end"}>
                    {canEdit && (
                      <DropdownMenuItem
                        onClick={() => setIsEditing(true)}
                        disabled={isDeletingOrEditing}
                        className="cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeletingOrEditing}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        )}
      </div>

      {isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={undefined} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
