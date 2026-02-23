import { createContext, useContext, useState, ReactNode } from 'react';
import { organizerAPI, speakerAPI } from '@/api';
import { getSignedUrl } from '../lib/storage';

interface LogoContextType {
  logoUrl: string | null;
  refreshLogo: (userType?: string) => Promise<void>;
}

const LogoContext = createContext<LogoContextType>({ logoUrl: null, refreshLogo: async () => {} });

export function useLogoContext() {
  return useContext(LogoContext);
}

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const refreshLogo = async (userType?: string) => {
    try {
      if (userType === 'speaker') {
        const profile = await speakerAPI.getProfile();
        if (profile?.profile_photo && typeof profile.profile_photo === 'string') {
          const url = await getSignedUrl(profile.profile_photo);
          setLogoUrl(url);
        } else {
          setLogoUrl(null);
        }
      } else {
        const profile = await organizerAPI.getProfile();
        if (profile?.logo && typeof profile.logo === 'string') {
          const url = await getSignedUrl(profile.logo);
          setLogoUrl(url);
        } else {
          setLogoUrl(null);
        }
      }
    } catch {
      // non-critical
    }
  };

  return (
    <LogoContext.Provider value={{ logoUrl, refreshLogo }}>
      {children}
    </LogoContext.Provider>
  );
}
