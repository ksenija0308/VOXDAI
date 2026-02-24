import { useState, useEffect } from 'react';
import { authAPI } from '@/api/auth';

export function useVideoPlaybackUrl(videoKey: string | undefined) {
  const [playbackUrl, setPlaybackUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!videoKey || !videoKey.startsWith('videos/')) {
      setPlaybackUrl('');
      return;
    }

    let cancelled = false;

    async function loadPlaybackUrl() {
      setIsLoading(true);
      try {
        const accessToken = await authAPI.getAccessToken();
        if (!accessToken || cancelled) return;

        const res = await fetch(
          'https://api.voxdai.com/functions/v1/generate-play-url',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ key: videoKey }),
          }
        );

        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.signedUrl) {
            setPlaybackUrl(data.signedUrl);
          }
        }
      } catch (error) {
        console.error('Failed to load video playback URL:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPlaybackUrl();

    return () => {
      cancelled = true;
    };
  }, [videoKey]);

  return { playbackUrl, isLoading };
}
