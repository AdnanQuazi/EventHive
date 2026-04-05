"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/types/database";

export type Club = Tables<"clubs">;
export type ClubInsert = TablesInsert<"clubs">;
export type ClubUpdate = TablesUpdate<"clubs">;
export type ClubMember = Tables<"club_members">;
export type ClubRole = "Owner" | "Admin" | "Manager";

type ActionResult<T> = {
  data: T | null;
  error: string | null;
};

export type ClubMemberProfile = {
  user_id: string;
  email: string | null;
  name: string;
  avatar_url: string | null;
  role: ClubRole;
  joined_at: string;
};

/**
 * Create a new club
 */
export async function createClub(
  clubData: Omit<ClubInsert, "owner_id">
): Promise<ActionResult<Club>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Insert club
    const { data, error } = await supabase
      .from("clubs")
      .insert({
        ...clubData,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Create club error:", error);
      return { data: null, error: error.message };
    }

    // Add owner as a club member
    const { error: memberError } = await supabase.from("club_members").insert({
      club_id: data.id,
      user_id: user.id,
      role: "Owner",
    });

    if (memberError) {
      console.error("Add owner as member error:", memberError);
      // Club is created but member addition failed - non-critical
    }

    revalidatePath("/profile");
    revalidatePath("/clubs");

    return { data, error: null };
  } catch (error) {
    console.error("Create club error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create club",
    };
  }
}

/**
 * Update an existing club
 */
export async function updateClub(
  clubId: string,
  updates: ClubUpdate
): Promise<ActionResult<Club>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Check if user has permission (owner or admin/manager)
    const hasPermission = await checkClubPermission(clubId, user.id, [
      "Owner",
      "Admin",
      "Manager",
    ]);

    if (!hasPermission) {
      return { data: null, error: "You don't have permission to update this club" };
    }

    // Update club
    const { data, error } = await supabase
      .from("clubs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", clubId)
      .select()
      .single();

    if (error) {
      console.error("Update club error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/clubs");
    revalidatePath(`/clubs/${clubId}`);

    return { data, error: null };
  } catch (error) {
    console.error("Update club error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to update club",
    };
  }
}

/**
 * Delete a club
 */
export async function deleteClub(clubId: string): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Check if user is the owner
    const { data: club } = await supabase
      .from("clubs")
      .select("owner_id")
      .eq("id", clubId)
      .single();

    if (!club || club.owner_id !== user.id) {
      return { data: null, error: "Only the club owner can delete the club" };
    }

    // Delete club (members will be deleted via CASCADE)
    const { error } = await supabase.from("clubs").delete().eq("id", clubId);

    if (error) {
      console.error("Delete club error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/clubs");

    return { data: null, error: null };
  } catch (error) {
    console.error("Delete club error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to delete club",
    };
  }
}

/**
 * Get a club by ID
 */
export async function getClubById(
  clubId: string
): Promise<ActionResult<Club>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .single();

    if (error) {
      console.error("Get club error:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Get club error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch club",
    };
  }
}

/**
 * Get all clubs for the current user (owned or member of)
 */
export async function getUserClubs(): Promise<ActionResult<Club[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Get clubs where user is owner
    const { data: ownedClubs, error: ownedError } = await supabase
      .from("clubs")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (ownedError) {
      console.error("Get owned clubs error:", ownedError);
      return { data: null, error: ownedError.message };
    }

    // Get clubs where user is a member (but not owner)
    const { data: memberClubIds, error: memberError } = await supabase
      .from("club_members")
      .select("club_id")
      .eq("user_id", user.id);

    if (memberError) {
      console.error("Get member clubs error:", memberError);
      return { data: ownedClubs || [], error: null }; // Return owned clubs only
    }

    const memberClubIdList = memberClubIds.map((m) => m.club_id);

    // Fetch member clubs (exclude owned clubs)
    const { data: memberClubs, error: memberClubsError } = await supabase
      .from("clubs")
      .select("*")
      .in("id", memberClubIdList)
      .neq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (memberClubsError) {
      console.error("Get member clubs error:", memberClubsError);
      return { data: ownedClubs || [], error: null };
    }

    // Combine clubs
    const allClubs = [...(ownedClubs || []), ...(memberClubs || [])];

    if (allClubs.length === 0) {
      return { data: [], error: null };
    }

    // Fetch member counts for all clubs shown on profile
    const clubIds = allClubs.map((club) => club.id);
    const { data: membershipRows, error: membershipError } = await supabase
      .from("club_members")
      .select("club_id")
      .in("club_id", clubIds);

    if (membershipError) {
      console.error("Get club member counts error:", membershipError);
      return { data: allClubs, error: null };
    }

    const memberCountByClub = (membershipRows || []).reduce<Record<string, number>>(
      (acc, row) => {
        acc[row.club_id] = (acc[row.club_id] || 0) + 1;
        return acc;
      },
      {}
    );

    const clubsWithMemberCount = allClubs.map((club) => ({
      ...club,
      member_count: memberCountByClub[club.id] || 0,
    }));

    return { data: clubsWithMemberCount as Club[], error: null };
  } catch (error) {
    console.error("Get user clubs error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch clubs",
    };
  }
}

/**
 * Add a member to a club
 */
export async function addClubMember(
  clubId: string,
  userId: string,
  role: ClubRole = "Manager"
): Promise<ActionResult<ClubMember>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Check if current user has permission (owner or admin)
    const hasPermission = await checkClubPermission(clubId, user.id, [
      "Owner",
      "Admin",
    ]);

    if (!hasPermission) {
      return {
        data: null,
        error: "You don't have permission to add members to this club",
      };
    }

    // Add member
    const { data, error } = await supabase
      .from("club_members")
      .insert({
        club_id: clubId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error("Add club member error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/clubs/${clubId}`);

    return { data, error: null };
  } catch (error) {
    console.error("Add club member error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to add club member",
    };
  }
}

/**
 * Remove a member from a club
 */
export async function removeClubMember(
  clubId: string,
  userId: string
): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Check if current user has permission (owner or admin)
    const hasPermission = await checkClubPermission(clubId, user.id, ["Owner"]);

    if (!hasPermission) {
      return {
        data: null,
        error: "You don't have permission to remove members from this club",
      };
    }

    // Prevent removing the owner
    const { data: member } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", clubId)
      .eq("user_id", userId)
      .single();

    if (member?.role === "Owner") {
      return { data: null, error: "Cannot remove the club owner" };
    }

    // Remove member
    const { error } = await supabase
      .from("club_members")
      .delete()
      .eq("club_id", clubId)
      .eq("user_id", userId);

    if (error) {
      console.error("Remove club member error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/clubs/${clubId}`);

    return { data: null, error: null };
  } catch (error) {
    console.error("Remove club member error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to remove club member",
    };
  }
}

/**
 * Update a member's role in a club (owner only)
 */
export async function updateClubMemberRole(
  clubId: string,
  userId: string,
  role: Exclude<ClubRole, "Owner">
): Promise<ActionResult<ClubMember>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("owner_id")
      .eq("id", clubId)
      .single();

    if (clubError || !club) {
      return { data: null, error: "Club not found" };
    }

    if (club.owner_id !== user.id) {
      return { data: null, error: "Only the club owner can reassign roles" };
    }

    // Prevent changing the owner's mapped membership role
    if (userId === club.owner_id) {
      return { data: null, error: "Owner role cannot be reassigned" };
    }

    const { data, error } = await supabase
      .from("club_members")
      .update({ role })
      .eq("club_id", clubId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Update club member role error:", error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/clubs/${clubId}`);
    revalidatePath("/profile");

    return { data, error: null };
  } catch (error) {
    console.error("Update club member role error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}

/**
 * Get all members of a club
 */
export async function getClubMembers(
  clubId: string
): Promise<ActionResult<ClubMember[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("club_members")
      .select("*")
      .eq("club_id", clubId)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Get club members error:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Get club members error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch club members",
    };
  }
}

/**
 * Get club members with auth profile details (any member can view)
 */
export async function getClubMembersWithProfilesForMembers(
  clubId: string
): Promise<ActionResult<ClubMemberProfile[]>> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Check if user is a member of this club
    const { data: membership, error: membershipError } = await supabase
      .from("club_members")
      .select("id")
      .eq("club_id", clubId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return { data: null, error: "You are not a member of this club" };
    }

    const membersResult = await getClubMembers(clubId);
    if (membersResult.error || !membersResult.data) {
      return { data: null, error: membersResult.error || "Failed to fetch members" };
    }

    const members = membersResult.data;

    const profileRows = await Promise.all(
      members.map(async (member) => {
        const { data: userData, error: profileError } =
          await adminClient.auth.admin.getUserById(member.user_id);

        if (profileError || !userData.user) {
          return {
            user_id: member.user_id,
            email: null,
            name: "Unknown User",
            avatar_url: null,
            role: member.role,
            joined_at: member.joined_at || new Date().toISOString(),
          } satisfies ClubMemberProfile;
        }

        return {
          user_id: member.user_id,
          email: userData.user.email || null,
          name: userData.user.user_metadata?.name || userData.user.email || "Unknown User",
          avatar_url: userData.user.user_metadata?.avatar_url || null,
          role: member.role,
          joined_at: member.joined_at || new Date().toISOString(),
        } satisfies ClubMemberProfile;
      })
    );

    return { data: profileRows, error: null };
  } catch (error) {
    console.error("Get club members with profiles error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch club members",
    };
  }
}

/**
 * Get club members with auth profile details (owner/admin/manager only)
 */
export async function getClubMembersWithProfiles(
  clubId: string
): Promise<ActionResult<ClubMemberProfile[]>> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    const hasPermission = await checkClubPermission(clubId, user.id, [
      "Owner",
      "Admin",
      "Manager",
    ]);

    if (!hasPermission) {
      return { data: null, error: "You don't have permission to view club members" };
    }

    const membersResult = await getClubMembers(clubId);
    if (membersResult.error || !membersResult.data) {
      return { data: null, error: membersResult.error || "Failed to fetch members" };
    }

    const members = membersResult.data;

    const profileRows = await Promise.all(
      members.map(async (member) => {
        const { data: userData, error: profileError } =
          await adminClient.auth.admin.getUserById(member.user_id);

        if (profileError || !userData.user) {
          return {
            user_id: member.user_id,
            email: null,
            name: "Unknown User",
            avatar_url: null,
            role: member.role,
            joined_at: member.joined_at || new Date().toISOString(),
          } satisfies ClubMemberProfile;
        }

        return {
          user_id: member.user_id,
          email: userData.user.email ?? null,
          name:
            userData.user.user_metadata?.name ||
            userData.user.email?.split("@")[0] ||
            "Member",
          avatar_url:
            userData.user.user_metadata?.avatar_url ||
            userData.user.user_metadata?.picture ||
            null,
          role: member.role,
          joined_at: member.joined_at || new Date().toISOString(),
        } satisfies ClubMemberProfile;
      })
    );

    return { data: profileRows, error: null };
  } catch (error) {
    console.error("Get club members with profiles error:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch member profile details",
    };
  }
}

/**
 * Lookup a user by email for club invitation (owner only)
 */
export async function findUserByEmailForClub(
  clubId: string,
  email: string
): Promise<
  ActionResult<{
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  }>
> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("owner_id")
      .eq("id", clubId)
      .single();

    if (clubError || !club) {
      return { data: null, error: "Club not found" };
    }

    if (club.owner_id !== user.id) {
      return { data: null, error: "Only the club owner can invite members" };
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { data: null, error: "Email is required" };
    }

    let users: any[] = [];
    const result = await (adminClient.auth.admin.listUsers as any)({
      page: 1,
      perPage: 1000,
    });
    users = result?.data?.users || [];

    const matched = users.find(
      (u) => typeof u.email === "string" && u.email.toLowerCase() === normalizedEmail
    );

    if (!matched) {
      return { data: null, error: "No user found with this email" };
    }

    return {
      data: {
        id: matched.id,
        email: matched.email,
        name: matched.user_metadata?.name || matched.email.split("@")[0] || "User",
        avatar_url: matched.user_metadata?.avatar_url || matched.user_metadata?.picture || null,
      },
      error: null,
    };
  } catch (error) {
    console.error("Find user by email error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to find user",
    };
  }
}

/**
 * Helper function to check if user has permission for a club
 */
async function checkClubPermission(
  clubId: string,
  userId: string,
  allowedRoles: ClubRole[]
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Check if user is owner
    const { data: club } = await supabase
      .from("clubs")
      .select("owner_id")
      .eq("id", clubId)
      .single();

    if (club?.owner_id === userId) {
      return true;
    }

    // Check if user has required role
    const { data: member } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", clubId)
      .eq("user_id", userId)
      .single();

    return member ? allowedRoles.includes(member.role) : false;
  } catch (error) {
    console.error("Check club permission error:", error);
    return false;
  }
}

/**
 * Get clubs that user can manage (owner, admin, or manager)
 */
export async function getManagedClubs(): Promise<ActionResult<Club[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: "User not authenticated" };
    }

    // Get clubs where user is owner
    const { data: ownedClubs, error: ownedError } = await supabase
      .from("clubs")
      .select("*")
      .eq("owner_id", user.id);

    if (ownedError) {
      console.error("Get owned clubs error:", ownedError);
      return { data: null, error: ownedError.message };
    }

    // Get clubs where user is admin or manager
    const { data: managedMemberships, error: managedError } = await supabase
      .from("club_members")
      .select("club_id")
      .eq("user_id", user.id)
      .in("role", ["Admin", "Manager"]);

    if (managedError) {
      console.error("Get managed clubs error:", managedError);
      return { data: ownedClubs || [], error: null };
    }

    const managedClubIds = managedMemberships.map((m) => m.club_id);

    if (managedClubIds.length === 0) {
      return { data: ownedClubs || [], error: null };
    }

    // Fetch managed clubs (exclude owned clubs to avoid duplicates)
    const { data: managedClubs, error: managedClubsError } = await supabase
      .from("clubs")
      .select("*")
      .in("id", managedClubIds)
      .neq("owner_id", user.id);

    if (managedClubsError) {
      console.error("Get managed clubs error:", managedClubsError);
      return { data: ownedClubs || [], error: null };
    }

    // Combine owned and managed clubs
    const allManagedClubs = [...(ownedClubs || []), ...(managedClubs || [])];

    return { data: allManagedClubs, error: null };
  } catch (error) {
    console.error("Get managed clubs error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch managed clubs",
    };
  }
}
