import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3a218522`;

// Create Supabase client singleton
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

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
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name, userType }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Sign up failed');
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
  }
};

// File Upload API
export const fileAPI = {
  upload: async (file: File, type: 'photo' | 'logo'): Promise<string> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'File upload failed');
    }

    return data.url; // Return the signed URL
  }
};

// Organizer Profile API
export const organizerAPI = {
  saveProfile: async (profileData: any) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/organizer/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save profile');
    }

    return data;
  },

  getProfile: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/organizer/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile');
    }

    return data.profile;
  }
};

// Speaker Profile API
export const speakerAPI = {
  saveProfile: async (profileData: any) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/speaker/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save profile');
    }

    return data;
  },

  getProfile: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/speaker/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile');
    }

    return data.profile;
  }
};
