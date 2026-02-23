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

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  resetPasswordForEmail: async (email: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/send-reset-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Reset password failed: ${response.status}`);
    }

    return response.json();
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
