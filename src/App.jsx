import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import EventPage from './pages/EventPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public — EventPage decides access internally, based on the
          schedule's own visibility and the viewer's membership, not
          on whether this route is "protected". */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/events/:eventId" element={<EventPage />} />

      {/* Genuinely auth-only: no logged-out version makes sense here. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}