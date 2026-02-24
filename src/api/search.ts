import { supabase } from '@/lib/supabaseClient';
import { authAPI } from './auth';

// Search API
const accessToken = await authAPI.getAccessToken();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

export const searchAPI = {
  searchSpeakers: async (userPrompt: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

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

    return await response.json();
  },

  searchOrganizers: async (userPrompt: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

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

    return await response.json();
  }
};
