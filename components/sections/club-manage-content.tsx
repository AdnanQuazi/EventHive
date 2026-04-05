"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  addClubMember,
  findUserByEmailForClub,
  removeClubMember,
  type ClubMemberProfile,
  updateClubMemberRole,
} from "@/lib/actions/clubs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown, Loader2, Mail, MapPin, Search, Shield, UserPlus, Users, X } from "lucide-react";

interface ClubManageContentProps {
  club: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    city: string | null;
    created_at: string;
  };
  initialMembers: ClubMemberProfile[];
}

type AssignableRole = "Admin" | "Manager";

export function ClubManageContent({ club, initialMembers }: ClubManageContentProps) {
  const [members, setMembers] = useState<ClubMemberProfile[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AssignableRole>("Manager");
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [roleSavingUserId, setRoleSavingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  } | null>(null);

  const memberIds = useMemo(() => new Set(members.map((m) => m.user_id)), [members]);

  const handleLookup = async () => {
    const normalized = email.trim();
    if (!normalized) {
      toast.error("Enter an email address first");
      return;
    }

    setIsSearching(true);
    setMatchedUser(null);

    try {
      const result = await findUserByEmailForClub(club.id, normalized);
      if (result.error || !result.data) {
        toast.error(result.error || "User not found");
        return;
      }

      setMatchedUser(result.data);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvite = async () => {
    if (!matchedUser) return;

    if (memberIds.has(matchedUser.id)) {
      toast.error("This user is already a member of the club");
      return;
    }

    setIsInviting(true);

    try {
      const result = await addClubMember(club.id, matchedUser.id, inviteRole);
      if (result.error || !result.data) {
        toast.error(result.error || "Failed to add member");
        return;
      }

      setMembers((prev) => [
        ...prev,
        {
          user_id: matchedUser.id,
          email: matchedUser.email,
          name: matchedUser.name,
          avatar_url: matchedUser.avatar_url,
          role: inviteRole,
          joined_at: new Date().toISOString(),
        },
      ]);

      toast.success("Member added to club");
      setMatchedUser(null);
      setEmail("");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: AssignableRole) => {
    setRoleSavingUserId(userId);
    try {
      const result = await updateClubMemberRole(club.id, userId, role);
      if (result.error || !result.data) {
        toast.error(result.error || "Failed to update role");
        return;
      }

      setMembers((prev) =>
        prev.map((member) =>
          member.user_id === userId ? { ...member, role } : member
        )
      );

      toast.success("Role updated");
    } finally {
      setRoleSavingUserId(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      const result = await removeClubMember(club.id, userId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setMembers((prev) => prev.filter((member) => member.user_id !== userId));
      toast.success("Member removed");
    } finally {
      setRemovingUserId(null);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <div className="aspect-4/3 h-full w-full">
              {club.image_url ? (
                <img src={club.image_url} alt={club.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-purple-500 via-blue-500 to-cyan-500" />
              )}
            </div>
          </div>

          <div className="md:col-span-3 p-6 md:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="bg-yellow-500/15 text-yellow-700 border-0">
                <Crown className="mr-1 h-3.5 w-3.5" />
                Owner Panel
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-700 border-0">
                <Users className="mr-1 h-3.5 w-3.5" />
                {members.length} Members
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">{club.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              {club.description || "No description added yet."}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {club.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{club.city}</span>
                </div>
              )}
              <span>Created {format(new Date(club.created_at), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-5 w-5" />
              Add Member by Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="flex gap-2">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@example.com"
                  type="email"
                />
                <Button type="button" onClick={handleLookup} disabled={isSearching} className="rounded-full">
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as AssignableRole)}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900">
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {matchedUser && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={matchedUser.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(matchedUser.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{matchedUser.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{matchedUser.email}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleInvite}
                  disabled={isInviting || memberIds.has(matchedUser.id)}
                  className="w-full rounded-full"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inviting...
                    </>
                  ) : memberIds.has(matchedUser.id) ? (
                    "Already a member"
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Invite as {inviteRole}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5" />
              Members & Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members found.</p>
            ) : (
              members
                .slice()
                .sort((a, b) => (a.role === "Owner" ? -1 : b.role === "Owner" ? 1 : 0))
                .map((member) => (
                  <div
                    key={member.user_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{member.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{member.email || "No email"}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Joined {format(new Date(member.joined_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {member.role === "Owner" ? (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-0">Owner</Badge>
                        ) : (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(value) =>
                                handleRoleChange(member.user_id, value as AssignableRole)
                              }
                              disabled={roleSavingUserId === member.user_id}
                            >
                              <SelectTrigger className="w-36 bg-white border-slate-300 text-slate-900">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-200 text-slate-900">
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="rounded-full"
                              onClick={() => handleRemove(member.user_id)}
                              disabled={removingUserId === member.user_id}
                            >
                              {removingUserId === member.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="mr-1 h-4 w-4" />
                                  Remove
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
