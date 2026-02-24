import {supabase} from '@/lib/supabaseClient';

// File Upload API
export const fileAPI = {
  upload: async (file: File, type: 'photo' | 'logo'): Promise<string> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { uploadToProfileMedia } = await import('@/lib/storage');

    const prefix = type === 'photo' ? 'profile' : 'intro';
    return await uploadToProfileMedia({
      userId: user.id,
      file,
      prefix: prefix as 'profile' | 'intro',
    });
  }
};
