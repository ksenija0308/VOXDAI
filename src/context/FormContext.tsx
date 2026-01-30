import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormData } from '../types/formData';
import { useFormData } from '../hooks/useFormData';
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

            toast.success('Account created successfully! Please complete your profile.');
            // Navigate to first profile creation screen
            if (signupUserType === 'organizer') {
              navigate('/onboarding/organizer/basics', { replace: true });
            } else {
              navigate('/onboarding/speaker/basics', { replace: true });
            }
            return;
          }

          // Not a sign-up callback, check for existing profile
          const userType = session.user?.user_metadata?.userType;
          if (userType) {
            formMethods.setFormData(prev => ({ ...prev, userType }));

            try {
              const profile = userType === 'organizer'
                ? await organizerAPI.getProfile()
                : await speakerAPI.getProfile();

              if (profile) {
                formMethods.setFormData(prev => ({ ...prev, ...profile }));
                // Only redirect to dashboard if NOT currently in onboarding flow
                const isOnboardingRoute = location.pathname.startsWith('/onboarding/');
                if (!isOnboardingRoute) {
                  navigate('/dashboard', { replace: true });
                }
              } else {
                // Profile doesn't exist, go to profile creation
                if (userType === 'organizer') {
                  navigate('/onboarding/organizer/basics', { replace: true });
                } else {
                  navigate('/onboarding/speaker/basics', { replace: true });
                }
              }
            } catch (err) {
              if (userType === 'organizer') {
                navigate('/onboarding/organizer/basics', { replace: true });
              } else {
                navigate('/onboarding/speaker/basics', { replace: true });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Silently fail - user can still use the app
      }
    };

    loadProfile();
  }, [navigate]);

  return (
    <FormContext.Provider value={formMethods}>
      {children}
    </FormContext.Provider>
  );
}
