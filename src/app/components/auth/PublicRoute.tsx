import { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  // Always render public content; onboarding/dashboard access
  // is controlled by ProtectedRoute.
  return <>{children}</>;
}
