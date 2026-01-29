import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

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

// Sign up new user
export async function signUp(email: string, password: string, name: string, userType: 'organizer' | 'speaker'): Promise<AuthResponse> {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3a218522/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name, userType })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Sign up failed' };
    }

    // Sign in after successful signup
    return signIn(email, password);
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: String(error) };
  }
}

// Sign in
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.session || !data.user) {
      return { error: 'No session created' };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.name,
      userType: data.user.user_metadata.userType
    };

    return {
      user,
      accessToken: data.session.access_token
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: String(error) };
  }
}

// Sign out
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Get current session
export async function getCurrentSession(): Promise<AuthResponse> {
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
}

// Get access token
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}
