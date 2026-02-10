import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { organizerAPI } from '../utils/api';
import { getSignedUrl } from '../lib/storage';

interface LogoContextType {
  logoUrl: string | null;
  refreshLogo: () => Promise<void>;
}

const LogoContext = createContext<LogoContextType>({ logoUrl: null, refreshLogo: async () => {} });

export function useLogoContext() {
  return useContext(LogoContext);
}

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const refreshLogo = async () => {
    try {
      const profile = await organizerAPI.getProfile();
      if (profile?.logo && typeof profile.logo === 'string') {
        const url = await getSignedUrl(profile.logo);
        setLogoUrl(url);
      } else {
        setLogoUrl(null);
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
