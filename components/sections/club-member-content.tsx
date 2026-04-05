"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ClubChatContent } from "./club-chat-content";

interface ClubMemberContentProps {
  club: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    city: string | null;
    created_at: string;
    owner_id: string;
  };
  members: {
    user_id: string;
    email: string | null;
    name: string;
    avatar_url: string | null;
    role: string;
    joined_at: string;
  }[];
  currentUserId: string;
}

export function ClubMemberContent({ club, members, currentUserId }: ClubMemberContentProps) {
  const owner = members.find(member => member.role === "Owner");
  const memberCount = members.length;

  return (
    <div className="space-y-6">
      {/* Club Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={club.image_url || undefined} />
              <AvatarFallback className="text-lg">
                {club.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{club.name}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {club.city || "Location not specified"}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {memberCount} member{memberCount !== 1 ? "s" : ""}
                </div>
              </div>
              {club.description && (
                <p className="text-gray-700 mt-2">{club.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Club Owner Info */}
      {owner && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Club Owner:</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={owner.avatar_url || undefined} />
                  <AvatarFallback>
                    {owner.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{owner.name}</span>
                <Badge variant="secondary" className="text-xs">
                  Owner
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Club Members ({memberCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div key={member.user_id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{member.name}</p>
                    <Badge
                      variant={member.role === "Owner" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Joined {format(new Date(member.joined_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Section */}
      <Card>
        <CardContent className="p-0">
          <ClubChatContent
            clubId={club.id}
            userId={currentUserId}
            clubOwnerId={club.owner_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
