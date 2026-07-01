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
import { supabase } from './lib/supabase';

export default function App() {
  // Sign in silently in background — never block rendering
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) return; // already logged in

      const email = import.meta.env.VITE_DEFAULT_EMAIL || 'sharafath2001@hotmail.com';
      const password = import.meta.env.VITE_DEFAULT_PASSWORD || 'TrainTrackPassword123!';

      supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
        if (error) supabase.auth.signUp({ email, password });
      });
    });
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
        <Route path="/workout/:id" element={<WorkoutDetail />} />
        <Route path="/active-workout/:id" element={<ActiveWorkout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
