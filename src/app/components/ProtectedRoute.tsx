import { ReactNode, useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI, organizerAPI, speakerAPI } from '../../utils/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

interface AuthState {
  isAuthenticated: boolean;
  userType: string | null;
  hasProfile: boolean;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const location = useLocation();
  const hasCheckedFlagRef = useRef(false);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Prevent double-checking (React Strict Mode)
    // Check BEFORE calling async function so both calls don't start
    if (isCheckingRef.current) {
      console.log('[ProtectedRoute] Already checking, skipping duplicate check');
      return;
    }
    isCheckingRef.current = true;

    // Reset authState to null when location changes to show loading and prevent stale state redirects
    setAuthState(null);

    const checkAuthAndProfile = async () => {
      console.log('[ProtectedRoute] Checking auth, pathname:', location.pathname);
      try {
        const session = await authAPI.getSession();

        if (!session) {
          console.log('[ProtectedRoute] No session found');
          setAuthState({ isAuthenticated: false, userType: null, hasProfile: false });
          isCheckingRef.current = false;
          return;
        }

        const userType = session.user?.user_metadata?.userType;
        console.log('[ProtectedRoute] User type:', userType);

        if (!userType) {
          setAuthState({ isAuthenticated: true, userType: null, hasProfile: false });
          isCheckingRef.current = false;
          return;
        }

        // Only check for profile existence if accessing dashboard
        // Skip this check for onboarding routes to avoid unnecessary 404 errors
        const isDashboard = location.pathname === '/dashboard';
        const isOnboarding = location.pathname.startsWith('/onboarding/');

        if (isOnboarding) {
          console.log('[ProtectedRoute] On onboarding route, allowing access');
          // User is in onboarding, don't check profile - assume it doesn't exist yet
          setAuthState({
            isAuthenticated: true,
            userType,
            hasProfile: false
          });
          isCheckingRef.current = false;
          return;
        }

        if (isDashboard) {
          // Check if profile was just completed or saved
          const profileCompleted = sessionStorage.getItem('voxd_profile_completed');
          const profileSaved = sessionStorage.getItem('voxd_profile_saved');

          console.log('[ProtectedRoute] Dashboard access, flags:', {
            profileCompleted,
            profileSaved,
            hasCheckedFlag: hasCheckedFlagRef.current
          });

          if (profileCompleted === 'true' || profileSaved === 'true') {
            console.log('[ProtectedRoute] Flag found, allowing dashboard access without API check');

            // NOTE:
            // We intentionally do NOT clear the flags here.
            // In React Strict Mode, effects can run twice on mount,
            // which was causing a race where the first run consumed
            // and cleared the flag, and the second run fell back to
            // the API check and redirected back to onboarding.
            // Keeping the flags for the lifetime of the tab avoids
            // that issue while still scoping them to the session.

            setAuthState({
              isAuthenticated: true,
              userType,
              hasProfile: true
            });
            isCheckingRef.current = false;
            return;
          }

          // Check if profile exists before allowing dashboard access
          console.log('[ProtectedRoute] No flag found, checking profile via API...');
          try {
            const profile = userType === 'organizer'
              ? await organizerAPI.getProfile()
              : await speakerAPI.getProfile();

            console.log('[ProtectedRoute] Profile check result:', !!profile);
            setAuthState({
              isAuthenticated: true,
              userType,
              hasProfile: !!profile
            });
          } catch (error) {
            // Profile doesn't exist
            console.error('[ProtectedRoute] Error loading profile:', error);
            setAuthState({
              isAuthenticated: true,
              userType,
              hasProfile: false
            });
          }
          isCheckingRef.current = false;
          return;
        }

        // For any other route, just authenticate without profile check
        setAuthState({
          isAuthenticated: true,
          userType,
          hasProfile: true // Assume true for other routes
        });
        isCheckingRef.current = false;
      } catch (error) {
        console.error('[ProtectedRoute] Error checking authentication:', error);
        setAuthState({ isAuthenticated: false, userType: null, hasProfile: false });
        isCheckingRef.current = false;
      }
    };

    checkAuthAndProfile();

    // Reset the checking flag when location changes
    return () => {
      isCheckingRef.current = false;
    };
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

  if (isDashboardRoute && !authState.hasProfile && authState.userType) {
    // Before redirecting, re-check the in-memory flags to avoid
    // redirect loops when coming straight from the success screen.
    const profileCompleted = sessionStorage.getItem('voxd_profile_completed');
    const profileSaved = sessionStorage.getItem('voxd_profile_saved');

    if (profileCompleted === 'true' || profileSaved === 'true') {
      // User has just completed or saved their profile in this tab,
      // so allow dashboard access even if authState is still stale.
      return <>{children}</>;
    }

    // Redirect to appropriate onboarding flow if no completion/save flag
    const onboardingPath = authState.userType === 'organizer'
      ? '/onboarding/organizer/basics'
      : '/onboarding/speaker/basics';
    return <Navigate to={onboardingPath} replace />;
  }

  // Authenticated and authorized, render children
  return <>{children}</>;
}
