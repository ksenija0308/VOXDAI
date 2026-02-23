import { supabase } from '@/lib/supabaseClient';
import { authAPI } from './auth';

// Speaker Profile API
export const speakerAPI = {
  saveProfile: async (profileData: any) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        user_type: 'speaker',
      }, {
        onConflict: 'id',
      });

    // Keep profiles.display_name in sync for messaging
    const displayName = profileData.full_name || '';
    if (displayName) {
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          role: 'speaker',
        }, { onConflict: 'user_id' });
    }

    // Only include fields that exist in speaker_profiles table
    const speakerData: any = {
      id: user.id,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (profileData.full_name) speakerData.full_name = profileData.full_name;
    if (profileData.professionalTitle) {
      speakerData.professional_title = profileData.professionalTitle;
      speakerData.professional_headline = profileData.professionalTitle;
    }
    if (profileData.speakerLocation) speakerData.speaker_country = profileData.speakerLocation;
    if (profileData.speakerCity) speakerData.speaker_city = profileData.speakerCity;
    if (profileData.profilePhoto === null) {
      speakerData.profile_photo = null;
    } else if (profileData.profilePhoto && typeof profileData.profilePhoto === 'string') {
      speakerData.profile_photo = profileData.profilePhoto;
    }
    if (profileData.speakerTagline) {
      speakerData.professional_headline = profileData.speakerTagline;
    }

    // Topics & Expertise (Screen: Speaker Topics)
    if (profileData.topics) speakerData.topics = profileData.topics;
    if (profileData.customTopics) speakerData.custom_topics = profileData.customTopics;
    if (profileData.topics && profileData.customTopics && profileData.customTopics.length > 0) {
      speakerData.topics = [...profileData.topics, ...profileData.customTopics];
    }

    // Experience (Screen: Speaker Experience)
    if (profileData.speakingFormats) speakerData.speaking_formats = profileData.speakingFormats;
    if (profileData.yearsOfExperience) speakerData.years_of_experience = profileData.yearsOfExperience;
    if (profileData.pastEngagements !== undefined) speakerData.past_engagements = profileData.pastEngagements;
    if (profileData.notableClients) speakerData.notable_clients = profileData.notableClients;

    // Bio & Portfolio (Screen: Speaker Bio & Portfolio)
    if (profileData.bio) speakerData.bio = profileData.bio;
    if (profileData.speakerWebsite) speakerData.speaker_website = profileData.speakerWebsite;
    if (profileData.speakerLinkedIn) speakerData.speaker_linked_in = profileData.speakerLinkedIn;
    if (profileData.speakerTwitter) speakerData.speaker_twitter = profileData.speakerTwitter;
    if (profileData.speakerInstagram) speakerData.speaker_instagram = profileData.speakerInstagram;
    if (profileData.speakerYoutube) speakerData.speaker_youtube = profileData.speakerYoutube;
    if (profileData.demoVideoUrl) speakerData.demo_video_url = profileData.demoVideoUrl;

    // Languages
    if (profileData.speakerLanguages) speakerData.speaker_languages = profileData.speakerLanguages;

    // Availability & Preferences (Screen: Speaker Availability & Preferences)
    if (profileData.geographicReach) speakerData.geographic_reach = profileData.geographicReach;
    if (profileData.willingToTravel !== undefined) speakerData.willing_to_travel = profileData.willingToTravel;
    if (profileData.preferredEventTypes) speakerData.preferred_event_types = profileData.preferredEventTypes;

    // Requirements & Pricing (Screen: Speaker Requirements & Pricing)
    if (profileData.speakingFeeRange) speakerData.speaking_fee_range = profileData.speakingFeeRange;
    if (profileData.technicalRequirements) speakerData.technical_requirements = profileData.technicalRequirements;
    if (profileData.specialAccommodations) speakerData.special_accommodations = profileData.specialAccommodations;

    // Video Introduction (Screen: Speaker Video Introduction)
    if (profileData.videoIntroUrl) {
      speakerData.video_intro_url = profileData.videoIntroUrl;
      speakerData.video_intro = profileData.videoIntroUrl;
    }

    // Availability Periods
    if (profileData.availabilityPeriods) speakerData.availability_periods = profileData.availabilityPeriods;

    const { data, error } = await supabase
      .from('speaker_profiles')
      .upsert(speakerData, {
        onConflict: 'id',
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Trigger embedding update after successful save
    try {
      const accessToken = await authAPI.getAccessToken();

      await fetch(`https://api.voxdai.com/functions/v1/create-speaker-embedding?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (embeddingError) {
      // Log but don't throw - embedding update is non-critical
      console.warn('Failed to update embedding:', embeddingError);
    }

    return data;
  },

  getProfile: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('speaker_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  }
};
