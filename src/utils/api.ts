import { supabase } from '@/lib/supabaseClient';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'organizer' | 'speaker';
}

export interface AuthResponse {
  user?: User;
  accessToken?: string;
  error?: string;
}

// Helper to get auth token from localStorage
// const getAuthToken = (): string | null => {
//   return localStorage.getItem('voxd_access_token');
// };

// Helper to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('voxd_access_token', token);
};

// Helper to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('voxd_access_token');
};

// Auth API
export const authAPI = {
  signUp: async (email: string, password: string, name: string, userType: 'organizer' | 'speaker') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          userType,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      setAuthToken(data.session.access_token);
    }

    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      setAuthToken(data.session.access_token);
    }

    // Ensure user_profiles row exists
    const userType = data.user?.user_metadata?.userType;
    if (data.user?.id) {
      await supabase
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          ...(userType ? { user_type: userType } : {}),
        }, { onConflict: 'id' });
    }

    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    clearAuthToken();
  },

  getSession: async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session?.access_token) {
      setAuthToken(data.session.access_token);
    }

    return data.session;
  },

  signInWithOAuth: async (provider: 'google' | 'linkedin_oidc', options?: { userType?: 'organizer' | 'speaker' }) => {
    // Store user type in localStorage if provided (for sign-up flow)
    if (options?.userType) {
      localStorage.setItem('voxd_signup_user_type', options.userType);
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
console.log(`${window.location.origin}/dashboard`)
    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  resetPasswordForEmail: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get and clear stored user type from OAuth sign-up flow
  getAndClearSignupUserType: () => {
    const userType = localStorage.getItem('voxd_signup_user_type');
    if (userType) {
      localStorage.removeItem('voxd_signup_user_type');
      return userType as 'organizer' | 'speaker';
    }
    return null;
  },

  // Update user metadata (e.g., to store user type)
  updateUserMetadata: async (metadata: { userType?: 'organizer' | 'speaker', [key: string]: any }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get current session with user info
  getCurrentSession: async (): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        return { error: 'No active session' };
      }

      const user: User = {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: data.session.user.user_metadata.name,
        userType: data.session.user.user_metadata.userType
      };

      return {
        user,
        accessToken: data.session.access_token
      };
    } catch (error) {
      console.error('Session error:', error);
      return { error: String(error) };
    }
  },

  // Get access token
  getAccessToken: async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }
};

// File Upload API
export const fileAPI = {
  upload: async (file: File, type: 'photo' | 'logo'): Promise<string> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { uploadToProfileMedia } = await import('@/lib/storage');

    const prefix = type === 'photo' ? 'profile' : 'intro';
    const storagePath = await uploadToProfileMedia({
      userId: user.id,
      file,
      prefix: prefix as 'profile' | 'intro',
    });

    return storagePath;
  }
};

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
    if (profileData.budgetRange) {
      organizationData.budget_range = profileData.budgetRange;
      if (profileData.budgetRange === 'unpaid') {
        organizationData.budget_min = 0;
        organizationData.budget_max = 0;
      } else {
        if (profileData.budgetMin !== undefined) organizationData.budget_min = profileData.budgetMin;
        if (profileData.budgetMax !== undefined) organizationData.budget_max = profileData.budgetMax;
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

    return data;
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

// Conversation API
export const conversationAPI = {
  getOrCreateConversation: async (matchId: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const accessToken = await authAPI.getAccessToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/get-or-create-conversation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ speaker_profile_id: matchId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get or create conversation: ${response.status}`);
    }

    return response.json();
  },

  sendMessage: async (conversationId: string, text: string) => {
    const body = text.trim();
    if (!body) return;

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      body,
    });

    if (error) throw error;
  },

  loadMessages: async (conversationId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, body, created_at, sender_id,
        sender:profiles!messages_sender_id_fkey (display_name, avatar_url, role)
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).reverse();
  },

  loadOlderMessages: async (conversationId: string, oldestCreatedAt: string, limit = 50) => {
    const { data, error } = await supabase
      .from('messages')
      .select('id,conversation_id,sender_id,body,created_at,edited_at,deleted_at,metadata')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .lt('created_at', oldestCreatedAt)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).reverse();
  },

  subscribeToMessages: (conversationId: string, onNewMessage: (m: any) => void) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  loadMyConversations: async () => {
    const { data: auth } = await supabase.auth.getUser();
    const currentUserId = auth.user?.id;
    if (!currentUserId) throw new Error('Not authenticated');

    // Get my conversation IDs
    const { data: myRows, error: myErr } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', currentUserId);

    if (myErr) throw myErr;
    if (!myRows?.length) return [];

    const convIds = myRows.map(r => r.conversation_id);

    // Get ALL participants for those conversations (includes me + other person)
    const { data: allParticipants, error: partErr } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', convIds);

    if (partErr) throw partErr;

    // Build a map: conversationId -> other user's ID
    const otherUserMap = new Map<string, string>();
    (allParticipants ?? []).forEach((p: any) => {
      if (p.user_id !== currentUserId) {
        otherUserMap.set(p.conversation_id, p.user_id);
      }
    });

    return myRows.map(r => ({
      conversation_id: r.conversation_id,
      last_read_at: r.last_read_at,
      other_user_id: otherUserMap.get(r.conversation_id) ?? null,
    }));
  },

  loadUnreadCount: async () => {
    const { data, error } = await supabase.rpc('my_total_unread_messages');
    if (error) throw error;
    return Number(data ?? 0);
  },

  markRead: async (conversationId: string) => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: now })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .select('conversation_id,user_id,last_read_at');

    console.log('markRead result:', data, error);

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error('markRead updated 0 rows. Participant row not found or blocked by RLS.');
    }
  },
};

// Search API
export const searchAPI = {
  searchOrganizations: async (searchQuery: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const apiUrl = `${supabaseUrl}/rest/v1/organization_profiles?select=*${encodeURIComponent(searchQuery)}*`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  searchSpeakers: async (userPrompt: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const accessToken = await authAPI.getAccessToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/search-speakers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        user_prompt: userPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  searchOrganizers: async (userPrompt: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const accessToken = await authAPI.getAccessToken();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/search-organizer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        user_prompt: userPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
};
