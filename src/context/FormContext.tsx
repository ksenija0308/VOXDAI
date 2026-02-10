import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormData } from '../types/formData';
import { useFormData } from '../hooks/useFormData';
import { useLogoContext } from './LogoContext';
import { authAPI, organizerAPI, speakerAPI } from '../utils/api';
import { toast } from 'sonner';

interface FormContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  updateFormData: (data: Partial<FormData>) => void;
  saveProfile: (data: FormData, showLoading: boolean) => Promise<boolean>;
  calculateProgress: () => number;
  isSaving: boolean;
  resetFormData: () => void;
  clearOnboardingData: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
}

interface FormProviderProps {
  children: ReactNode;
}

export function FormProvider({ children }: FormProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const formMethods = useFormData();
  const { refreshLogo } = useLogoContext();

  // Load profile on mount if user is authenticated
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const session = await authAPI.getSession();
        if (session) {
          // Check if this is an OAuth sign-up callback
          const signupUserType = authAPI.getAndClearSignupUserType();

          if (signupUserType) {
            formMethods.setFormData(prev => ({ ...prev, userType: signupUserType }));

            // Save user type to Supabase user metadata
            try {
              await authAPI.updateUserMetadata({ userType: signupUserType });
            } catch (error) {
              console.error('Failed to update user metadata:', error);
            }

            // Clear any stale profile completion flags before starting onboarding
            sessionStorage.removeItem('voxd_profile_completed');

            toast.success('Account created successfully! Please complete your profile.');
            // Navigate to first profile creation screen
            if (signupUserType === 'organizer') {
              navigate('/onboarding/organizer/basics', { replace: true });
            } else {
              navigate('/onboarding/speaker/basics', { replace: true });
            }
            return;
          }

          // Not a sign-up callback, load existing profile data
          const userType = session.user?.user_metadata?.userType;
          if (userType) {
            formMethods.setFormData(prev => ({ ...prev, userType }));

            // Skip profile loading on onboarding routes to avoid unnecessary 404 errors
            const isOnboarding = location.pathname.startsWith('/onboarding/');
            if (isOnboarding) {
              return;
            }

            try {
              const profile = userType === 'organizer'
                ? await organizerAPI.getProfile()
                : await speakerAPI.getProfile();

              if (profile) {
                formMethods.setFormData(prev => ({ ...prev, ...profile }));
                // Mark profile as completed so returning users can access dashboard
                sessionStorage.setItem('voxd_profile_completed', 'true');
                // Resolve logo/photo URL for header avatar
                refreshLogo(userType);
              }
            } catch (err) {
              // Profile doesn't exist or failed to load - ProtectedRoute will handle navigation
              console.error('Error loading profile:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Silently fail - user can still use the app
      }
    };

    loadProfile();
  }, [navigate, location.pathname]);

  return (
    <FormContext.Provider value={formMethods}>
      {children}
    </FormContext.Provider>
  );
}
