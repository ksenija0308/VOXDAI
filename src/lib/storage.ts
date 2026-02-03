import { supabase } from './supabaseClient';

const BUCKET_NAME = 'profile_media';

export interface UploadToProfileMediaParams {
  userId: string;
  file: File;
  prefix: 'profile' | 'intro';
}

export async function uploadToProfileMedia({
  userId,
  file,
  prefix,
}: UploadToProfileMediaParams): Promise<string> {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}.${fileExt}`;
  const filePath = `${userId}/${prefix}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data.path;
}

export async function getSignedUrl(
  path: string,
  expiresSeconds: number = 600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresSeconds);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  if (!data?.signedUrl) {
    throw new Error('No signed URL returned from storage');
  }

  return data.signedUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
