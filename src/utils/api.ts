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
const getAuthToken = (): string | null => {
  return localStorage.getItem('voxd_access_token');
};

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
        redirectTo: window.location.origin,
      },
    });

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

    const { data, error } = await supabase
      .from('organizer_profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  getProfile: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('organizer_profiles')
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

    const { data, error } = await supabase
      .from('speaker_profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
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
