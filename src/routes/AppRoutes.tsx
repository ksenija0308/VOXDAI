import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FormData } from '../types/formData';
import WelcomeScreen from '../app/components/WelcomeScreen';
import SignUpScreen from '../app/components/SignUpScreen';
import SignInForm from '../app/components/SignInForm';
import ForgotPasswordScreen from '../app/components/ForgotPasswordScreen';
import DashboardScreen from '../app/components/DashboardScreen';
import OrganizerWizard from '../app/components/OrganizerWizard';
import SpeakerWizard from '../app/components/SpeakerWizard';
import ProtectedRoute from '../app/components/ProtectedRoute';
import PublicRoute from '../app/components/PublicRoute';
import { organizerAPI, speakerAPI, authAPI } from '../utils/api';
import { toast } from 'sonner';

interface AppRoutesProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  setFormData: (data: FormData) => void;
  calculateProgress: () => number;
  isSaving: boolean;
  saveProfile: (data: FormData, showLoading: boolean) => Promise<boolean>;
  handleLogout: () => void;
  clearOnboardingData: () => void;
}

export default function AppRoutes({
  formData,
  updateFormData,
  setFormData,
  calculateProgress,
  isSaving,
  saveProfile,
  handleLogout,
  clearOnboardingData,
}: AppRoutesProps) {
  const navigate = useNavigate();

  // Handle sign-in success
  const handleSignInSuccess = async () => {
    try {
      // Get session to determine user type
      const session = await authAPI.getSession();
      const userType = session?.user?.user_metadata?.userType;

      if (userType) {
        setFormData(prev => ({ ...prev, userType }));

        // Try to load existing profile
        try {
          const profile = userType === 'organizer'
            ? await organizerAPI.getProfile()
            : await speakerAPI.getProfile();

          if (profile) {
            setFormData(prev => ({ ...prev, ...profile }));
            // Mark profile as completed in this tab so onboarding is blocked
            // when returning users go straight to the dashboard.
            sessionStorage.setItem('voxd_profile_completed', 'true');
            // Go to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            // Profile doesn't exist, go to profile creation
            if (userType === 'organizer') {
              navigate('/onboarding/organizer/basics', { replace: true });
            } else {
              navigate('/onboarding/speaker/basics', { replace: true });
            }
          }
        } catch (err) {
          // Profile doesn't exist, go to first profile creation screen
          if (userType === 'organizer') {
            navigate('/onboarding/organizer/basics', { replace: true });
          } else {
            navigate('/onboarding/speaker/basics', { replace: true });
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <WelcomeScreen
              formData={formData}
              updateFormData={updateFormData}
              nextScreen={() => navigate('/signup')}
              onShowSignIn={() => navigate('/login')}
            />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUpScreen
              formData={formData}
              updateFormData={updateFormData}
              nextScreen={() => {
                // After signup, navigate to appropriate onboarding
                // Ensure profile completion flag is cleared for new users
                sessionStorage.removeItem('voxd_profile_completed');

                if (formData.userType === 'organizer') {
                  navigate('/onboarding/organizer/basics');
                } else if (formData.userType === 'speaker') {
                  navigate('/onboarding/speaker/basics');
                }
              }}
              onShowSignIn={() => navigate('/login')}
            />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <SignInForm
              onSignInSuccess={handleSignInSuccess}
              onNavigateToSignUp={(userType) => {
                setFormData(prev => ({ ...prev, userType }));
                navigate('/signup');
              }}
            />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordScreen />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/onboarding/organizer/:step"
        element={
          <ProtectedRoute>
            <OrganizerWizard
              formData={formData}
              updateFormData={updateFormData}
              calculateProgress={calculateProgress}
              isSaving={isSaving}
              saveProfile={saveProfile}
              clearOnboardingData={clearOnboardingData}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/speaker/:step"
        element={
          <ProtectedRoute>
            <SpeakerWizard
              formData={formData}
              updateFormData={updateFormData}
              calculateProgress={calculateProgress}
              isSaving={isSaving}
              saveProfile={saveProfile}
              clearOnboardingData={clearOnboardingData}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardScreen formData={formData} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
