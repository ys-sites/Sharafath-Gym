import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import History from './pages/History';
import Programs from './pages/Programs';
import Profile from './pages/Profile';
import WorkoutLogger from './pages/WorkoutLogger';
import Nutrition from './pages/Nutrition';
import WorkoutDetail from './pages/WorkoutDetail';
import ActiveWorkout from './pages/ActiveWorkout';
import GenerateWorkout from './pages/GenerateWorkout';
import { supabase } from './lib/supabase';
import { SessionResponseSchema } from './lib/zodSchemas';

export default function App() {
  // Sign in silently in background — never block rendering
  useEffect(() => {
    if (!supabase) return;

    const performSessionMint = async (isRetry = false) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return; // Already has session

        const res = await fetch('/api/session', { method: 'POST' });
        if (!res.ok) {
          throw new Error(`Failed to fetch session: status ${res.status}`);
        }
        const rawData = await res.json();
        const parsed = SessionResponseSchema.safeParse(rawData);
        if (parsed.success) {
          await supabase.auth.setSession({
            access_token: parsed.data.access_token,
            refresh_token: parsed.data.refresh_token,
          });
        } else {
          console.warn('Session response validation failed:', parsed.error);
        }
      } catch (err) {
        console.error('Session establishment error:', err);
        if (!isRetry) {
          setTimeout(() => {
            performSessionMint(true).catch(console.error);
          }, 3000);
        }
      }
    };

    performSessionMint().catch(console.error);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
    return () => subscription.unsubscribe();
  }, []);

  // Render the app immediately — no loading gate
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="programs" element={<Programs />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/logger" element={<WorkoutLogger />} />
        <Route path="/generate-workout" element={<GenerateWorkout />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
        <Route path="/active-workout/:id" element={<ActiveWorkout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
