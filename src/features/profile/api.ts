import { supabase } from '@/lib/supabaseClient';
import { uploadToProfileMedia } from '@/lib/storage';

export interface AvailabilityPeriod {
  from: string;
  to: string;
  timezone: string;
  note?: string;
}

export interface OrganizationProfilePayload {
  fullName: string;
  professionalHeadline?: string;
  topics?: string[];
  speakingFormats?: string[];
  yearsOfExperience?: '0-1' | '1-3' | '3-5' | '5-10' | '10+';
  pastEngagements?: number | null;
  notableClients?: string | null;
  videoIntro?: string | null;
  geographicReach?: string;
  preferredEventTypes?: string[];
  availabilityPeriods?: AvailabilityPeriod[];
  profilePhoto?: File | string | null;
  videoIntroFile?: File | null;
}

export interface OrganizationProfile {
  id: string;
  full_name: string;
  professional_headline?: string;
  topics?: string[];
  speaking_formats?: string[];
  years_of_experience?: string;
  past_engagements?: number;
  notable_clients?: string;
  video_intro?: string;
  geographic_reach?: string;
  preferred_event_types?: string[];
  availability_periods?: AvailabilityPeriod[];
  profile_photo?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchOrganizationProfile(): Promise<OrganizationProfile | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('organization_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch organization profile: ${error.message}`);
  }

  return data;
}

export async function saveOrganizationProfile(
  payload: OrganizationProfilePayload
): Promise<OrganizationProfile> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const userId = user.id;

  await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      user_type: 'organizer',
    }, {
      onConflict: 'id',
    });

  let profilePhotoPath: string | null = null;
  if (payload.profilePhoto instanceof File) {
    profilePhotoPath = await uploadToProfileMedia({
      userId,
      file: payload.profilePhoto,
      prefix: 'profile',
    });
  } else if (typeof payload.profilePhoto === 'string') {
    profilePhotoPath = payload.profilePhoto;
  }

  let videoIntroPath: string | null = payload.videoIntro || null;
  if (payload.videoIntroFile instanceof File) {
    videoIntroPath = await uploadToProfileMedia({
      userId,
      file: payload.videoIntroFile,
      prefix: 'intro',
    });
  }

  const profileData = {
    id: userId,
    full_name: payload.fullName,
    professional_headline: payload.professionalHeadline || null,
    topics: payload.topics || [],
    speaking_formats: payload.speakingFormats || [],
    years_of_experience: payload.yearsOfExperience || null,
    past_engagements: payload.pastEngagements || null,
    notable_clients: payload.notableClients || null,
    video_intro: videoIntroPath,
    geographic_reach: payload.geographicReach || null,
    preferred_event_types: payload.preferredEventTypes || [],
    availability_periods: payload.availabilityPeriods || [],
    profile_photo: profilePhotoPath,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('organization_profiles')
    .upsert(profileData, {
      onConflict: 'id',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save organization profile: ${error.message}`);
  }

  return data;
}
