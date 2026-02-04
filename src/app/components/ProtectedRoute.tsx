import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../utils/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

interface AuthState {
  isAuthenticated: boolean;
  userType: string | null;
  hasCompletedProfile: boolean;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      try {
        const session = await authAPI.getSession();

        if (!session) {
          setAuthState({ isAuthenticated: false, userType: null, hasCompletedProfile: false });
          return;
        }

        const userType = session.user?.user_metadata?.userType;

        if (!userType) {
          setAuthState({ isAuthenticated: true, userType: null, hasCompletedProfile: false });
          return;
        }

        const profileCompleted = sessionStorage.getItem('voxd_profile_completed');
        const profileSaved = sessionStorage.getItem('voxd_profile_saved');
        const hasCompletedProfile = profileCompleted === 'true' || profileSaved === 'true';

        setAuthState({
          isAuthenticated: true,
          userType,
          hasCompletedProfile
        });
      } catch (error) {
        console.error('[ProtectedRoute] Error checking authentication:', error);
        setAuthState({ isAuthenticated: false, userType: null, hasCompletedProfile: false });
      }
    };

    checkAuthAndProfile();
  }, [location.pathname]);

  // Still loading
  if (authState === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, redirect to sign in
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is trying to access dashboard without completing profile
  const isDashboardRoute = location.pathname === '/dashboard';
  const isOnboardingRoute = location.pathname.startsWith('/onboarding/');

  if (isDashboardRoute && !authState.hasCompletedProfile && authState.userType) {

    const onboardingPath = authState.userType === 'organizer'
      ? '/onboarding/organizer/basics'
      : '/onboarding/speaker/basics';
    return <Navigate to={onboardingPath} replace />;
  }

  // If user has completed their profile in this tab, block access to onboarding routes
  if (isOnboardingRoute && authState.hasCompletedProfile && authState.userType) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authenticated and authorized, render children
  return <>{children}</>;
}
