import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Wraps protected routes. Nothing behind this renders until Clerk
 * confirms sign-in state — showing a loading state during that check
 * instead of flashing protected content then yanking it away.
 */
export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink text-mist text-sm">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}