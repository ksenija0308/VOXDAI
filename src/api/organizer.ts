import { supabase } from '@/lib/supabaseClient';
import { authAPI } from './auth';

// Organizer Profile API
export const organizerAPI = {
  saveProfile: async (profileData: any) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        user_type: 'organizer',
      }, {
        onConflict: 'id',
      });

    // Keep profiles.display_name in sync for messaging
    const displayName = profileData.organisationName || profileData.full_name || '';
    if (displayName) {
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          role: 'organizer',
        }, { onConflict: 'user_id' });
    }

    // Only include fields that exist in organization_profiles table
    const organizationData: any = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    // Screen 2 - Organiser Basics
    if (profileData.organisationName) {
      organizationData.organisation_name = profileData.organisationName;
      organizationData.full_name = profileData.organisationName;
    }
    if (profileData.website) organizationData.website = profileData.website;
    if (profileData.country) organizationData.country = profileData.country;
    if (profileData.city) organizationData.city = profileData.city;
    if (profileData.industries) organizationData.industries = profileData.industries;
    if (profileData.logo === null) {
      organizationData.logo = null;
      organizationData.profile_photo = null;
    } else if (profileData.logo && typeof profileData.logo === 'string') {
      organizationData.logo = profileData.logo;
      organizationData.profile_photo = profileData.logo;
    }
    if (profileData.tagline) {
      organizationData.tagline = profileData.tagline;
      organizationData.professional_headline = profileData.tagline;
    }

    // Screen 3 - About / Contact
    if (profileData.contactName) organizationData.contact_name = profileData.contactName;
    if (profileData.contactEmail) organizationData.contact_email = profileData.contactEmail;
    if (profileData.contactPhone) organizationData.contact_phone = profileData.contactPhone;
    if (profileData.calendarLink) organizationData.calendar_link = profileData.calendarLink;
    if (profileData.calendarType) organizationData.calendar_type = profileData.calendarType;
    if (profileData.linkedIn) organizationData.linked_in = profileData.linkedIn;
    if (profileData.instagram) organizationData.instagram = profileData.instagram;
    if (profileData.youtube) organizationData.youtube = profileData.youtube;
    if (profileData.twitter) organizationData.twitter = profileData.twitter;
    if (profileData.authorised !== undefined) organizationData.authorised = profileData.authorised;
    if (profileData.showInSpeakerSearch !== undefined) organizationData.show_in_speaker_search = profileData.showInSpeakerSearch;

    // Screen 4 - Event Types & Frequency
    if (profileData.eventTypes) organizationData.event_types = profileData.eventTypes;
    if (profileData.frequency) organizationData.frequency = profileData.frequency;
    if (profileData.eventSizes) organizationData.event_sizes = profileData.eventSizes;
    if (profileData.formats) organizationData.formats = profileData.formats;
    if (profileData.locations) organizationData.locations = profileData.locations;

    // Screen 5 - Speaker Preferences
    if (profileData.speakerFormats) {
      organizationData.speaker_formats = profileData.speakerFormats;
    }
    if (profileData.diversityGoals !== undefined) organizationData.diversity_goals = profileData.diversityGoals;
    if (profileData.diversityTargets) organizationData.diversity_targets = profileData.diversityTargets;
    if (profileData.languages) organizationData.languages = profileData.languages;
    if (profileData.eventReach && profileData.eventReach.length > 0) {
      organizationData.event_reach = profileData.eventReach;
    }
    if (profileData.budgetRange && profileData.budgetRange.length > 0) {
      organizationData.budget_range = profileData.budgetRange;
      if (profileData.budgetRange.includes('paid')) {
        if (profileData.budgetMin !== undefined) organizationData.budget_min = profileData.budgetMin;
        if (profileData.budgetMax !== undefined) organizationData.budget_max = profileData.budgetMax;
      } else {
        organizationData.budget_min = 0;
        organizationData.budget_max = 0;
      }
    }
    if (profileData.leadTime) organizationData.lead_time = profileData.leadTime;

    // Screen 6 - Review & Publish
    if (profileData.visibility) organizationData.visibility = profileData.visibility;

    // Additional fields (if used from CompleteOrganizationProfile or other sources)
    if (profileData.firstName && profileData.lastName) {
      organizationData.full_name = `${profileData.firstName} ${profileData.lastName}`;
    }
    if (profileData.professionalTitle) organizationData.professional_headline = profileData.professionalTitle;
    if (profileData.yearsOfExperience) organizationData.years_of_experience = profileData.yearsOfExperience;
    if (profileData.notableClients) organizationData.notable_clients = profileData.notableClients;
    if (profileData.videoIntroUrl) organizationData.video_intro = profileData.videoIntroUrl;
    if (profileData.geographicReach) organizationData.geographic_reach = profileData.geographicReach;
    if (profileData.profilePhoto && typeof profileData.profilePhoto === 'string') {
      organizationData.profile_photo = profileData.profilePhoto;
    }

    const { data, error } = await supabase
      .from('organization_profiles')
      .upsert(organizationData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Trigger embedding update after successful save
    try {
      const accessToken = await authAPI.getAccessToken();

      await fetch(`https://api.voxdai.com/functions/v1/create-organization-embedding?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (embeddingError) {
      // Log but don't throw - embedding update is non-critical
      console.warn('Failed to update organization embedding:', embeddingError);
    }

    return data;
  },

  getProfile: async () => {
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
      throw new Error(error.message);
    }

    // Map snake_case DB fields to camelCase formData fields
    return {
      ...data,
      showInSpeakerSearch: data.show_in_speaker_search ?? false,
    };
  },

  toggleSpeakerVisibility: async (showInSpeakerSearch: boolean) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const accessToken = await authAPI.getAccessToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/toggle-org-speaker-visibility`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        show_in_speaker_search: showInSpeakerSearch,
      }),
    });

    if (!response.ok) {
      throw new Error(`Toggle visibility failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
};
