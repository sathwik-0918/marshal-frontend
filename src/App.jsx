import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EventPage from './pages/EventPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/events/:eventId" element={<EventPage />} />
      </Route>
    </Routes>
  );
}