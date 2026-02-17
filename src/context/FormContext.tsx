import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormData } from '../types/formData';
import { useFormData } from '../hooks/useFormData';
import { useLogoContext } from './LogoContext';
import { authAPI, organizerAPI, speakerAPI } from '../utils/api';
import { supabase } from '../lib/supabaseClient';
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
  const handledByAuthChange = useRef(false);

  // Helper: load profile and navigate after OAuth sign-in
  const handleOAuthSignIn = async (userType: string, session: any) => {
    formMethods.setFormData(prev => ({ ...prev, userType }));

    // If the user hasn't completed onboarding yet, skip the profile API call
    // entirely — there's no profile to fetch and calling it would produce an error
    const profileCompleted = session.user?.user_metadata?.profileCompleted;
    if (!profileCompleted) {
      const path = userType === 'organizer'
        ? '/onboarding/organizer/basics'
        : '/onboarding/speaker/basics';
      navigate(path, { replace: true });
      return;
    }

    try {
      const profile = userType === 'organizer'
        ? await organizerAPI.getProfile()
        : await speakerAPI.getProfile();

      if (profile) {
        formMethods.setFormData(prev => ({ ...prev, ...profile }));
        sessionStorage.setItem('voxd_profile_completed', 'true');
        refreshLogo(userType);
        navigate('/dashboard', { replace: true });
      } else {
        // No profile yet, go to onboarding
        const path = userType === 'organizer'
          ? '/onboarding/organizer/basics'
          : '/onboarding/speaker/basics';
        navigate(path, { replace: true });
      }
    } catch {
      const path = userType === 'organizer'
        ? '/onboarding/organizer/basics'
        : '/onboarding/speaker/basics';
      navigate(path, { replace: true });
    }
  };

  // Listen for Supabase auth state changes (handles OAuth callback reliably).
  // INITIAL_SESSION fires when the listener is first registered (guaranteed),
  // SIGNED_IN fires on new sign-ins. We need both because the OAuth token
  // exchange may complete before or after our listener is set up.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) return;
        if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') return;

        // Only handle when on a public page (OAuth redirect lands on `/`)
        const path = window.location.pathname;
        if (path !== '/' && path !== '/login') return;

        handledByAuthChange.current = true;

        // Check if this is a sign-up flow
        const signupUserType = authAPI.getAndClearSignupUserType();

        if (signupUserType) {
          formMethods.setFormData(prev => ({ ...prev, userType: signupUserType }));
          try {
            await authAPI.updateUserMetadata({ userType: signupUserType });
          } catch (error) {
            console.error('Failed to update user metadata:', error);
          }
          sessionStorage.removeItem('voxd_profile_completed');
          toast.success('Account created successfully! Please complete your profile.');
          if (signupUserType === 'organizer') {
            navigate('/onboarding/organizer/basics', { replace: true });
          } else {
            navigate('/onboarding/speaker/basics', { replace: true });
          }
          return;
        }

        // Existing user OAuth sign-in
        const userType = session.user?.user_metadata?.userType;
        if (userType) {
          await handleOAuthSignIn(userType, session);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load profile on mount if user is authenticated
  useEffect(() => {
    const loadProfile = async () => {
      // Skip if the onAuthStateChange handler already handled this
      if (handledByAuthChange.current) {
        handledByAuthChange.current = false;
        return;
      }

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

            // Skip profile loading if user hasn't completed onboarding yet
            const profileCompleted = session.user?.user_metadata?.profileCompleted;
            if (!profileCompleted) {
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

                // Redirect to dashboard if on a public page (e.g., page refresh while authenticated)
                if (location.pathname === '/' || location.pathname === '/login') {
                  navigate('/dashboard', { replace: true });
                }
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
