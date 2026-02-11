import { supabase } from "@/lib/supabaseClient";
import { getSignedUrl } from "@/lib/storage";

export async function trackRecentMatchView({
  viewerRole,
  targetRole,
  targetProfileId,
  matchScore
}: {
  viewerRole: "speaker" | "organizer";
  targetRole: "speaker" | "organizer";
  targetProfileId: string;
  matchScore: number;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const viewerUserId = auth.user?.id;
  if (!viewerUserId) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("recent_matches")
    .upsert(
      {
        viewer_user_id: viewerUserId,
        viewer_role: viewerRole,
        target_profile_id: targetProfileId,
        target_role: targetRole,
        match_score: matchScore,
        last_viewed_at: new Date().toISOString(),
      },
      { onConflict: "viewer_user_id,viewer_role,target_profile_id" }
    );

  if (error) throw error;
}

export async function loadRecentMatches(viewerRole: "speaker" | "organizer") {
    const { data: auth } = await supabase.auth.getUser();
    const viewerUserId = auth.user?.id;
    if (!viewerUserId) throw new Error("Not authenticated");

    const { data: recentViews, error } = await supabase
        .from("recent_matches")
        .select("target_profile_id, target_role, match_score, last_viewed_at")
        .eq("viewer_user_id", viewerUserId)
        .eq("viewer_role", viewerRole)
        .order("last_viewed_at", { ascending: false })
        .limit(20);

    if (error) throw error;
    if (!recentViews?.length) return [];

    const speakerIds = recentViews
        .filter((v) => v.target_role === "speaker")
        .map((v) => v.target_profile_id);

    const orgIds = recentViews
        .filter((v) => v.target_role === "organizer")
        .map((v) => v.target_profile_id);

    const [speakersRes, orgsRes] = await Promise.all([
        speakerIds.length
            ? supabase.from("speaker_profiles").select("*").in("id", speakerIds)
            : Promise.resolve({ data: [], error: null }),
        orgIds.length
            ? supabase.from("organization_profiles").select("*").in("id", orgIds)
            : Promise.resolve({ data: [], error: null }),
    ]);
    if (speakersRes.error) throw speakersRes.error;
    if (orgsRes.error) throw orgsRes.error;

    const byKey = new Map<string, any>();
    (speakersRes.data || []).forEach((p: any) => byKey.set(`speaker:${p.id}`, p));
    (orgsRes.data || []).forEach((p: any) => byKey.set(`organizer:${p.id}`, p));

    const results = await Promise.all(
        recentViews.map(async (view) => {
            const key = `${view.target_role}:${view.target_profile_id}`;
            const profile: any = byKey.get(key);
            if (!profile) return null;

            let profilePhotoUrl: string | null = null;
            if (profile.profile_photo && typeof profile.profile_photo === "string") {
                try {
                    profilePhotoUrl = await getSignedUrl(profile.profile_photo);
                } catch {
                    profilePhotoUrl = null;
                }
            }

            return {
                id: profile.id,
                role: view.target_role,
                name: profile.full_name || "Unknown",
                topic:
                    profile.topics?.[0] ||
                    profile.professional_headline ||
                    "No topic specified",
                match: Number(view.match_score ?? 0),
                expertise:
                    profile.professional_headline ||
                    profile.speaker_tagline ||
                    profile.bio ||
                    "",
                availability: profile.availability_periods?.length
                    ? "Available"
                    : "Contact for availability",
                hasVideo:
                    !!profile.video_intro ||
                    !!profile.video_intro_url ||
                    !!profile.demo_video_url,
                speakingFormat: profile.speaking_formats || [],
                experienceLevel: profile.years_of_experience || "Not specified",
                language: profile.languages || ["English"],
                feeRange: profile.speaking_fee_range || "Contact for pricing",
                location:
                    profile.speaker_city && profile.speaker_location
                        ? `${profile.speaker_city}, ${profile.speaker_location}`
                        : profile.speaker_location || "",
                llmExplanation: "",
                bio: profile.bio || "",
                profilePhoto: profilePhotoUrl,
                profilePhotoPath: profile.profile_photo || null,
                lastViewedAt: view.last_viewed_at,
            };
        })
    );

    return results.filter(Boolean);
}
