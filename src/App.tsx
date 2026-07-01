import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import WorkoutLogger from './pages/WorkoutLogger';
import WorkoutDetail from './pages/WorkoutDetail';
import { supabase } from './lib/supabase';

// Route-level code splitting with React.lazy
const History = lazy(() => import('./pages/History'));
const Programs = lazy(() => import('./pages/Programs'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout'));

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    const bootstrap = async () => {
      try {
        // Reuse existing session if already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) { setReady(true); return; }

        // Otherwise sign in silently with the personal account
        const email = import.meta.env.VITE_DEFAULT_EMAIL || 'sharafath2001@hotmail.com';
        const password = import.meta.env.VITE_DEFAULT_PASSWORD || 'TrainTrackPassword123!';

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Account may not exist yet — create it
          await supabase.auth.signUp({ email, password });
        }
      } catch (e) {
        console.error('Auth bootstrap error:', e);
      } finally {
        // Always render the app — never block on a blank screen
        setReady(true);
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-neutral-400 text-sm font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  const Spinner = (
    <div className="h-screen flex items-center justify-center bg-[#0C0D12] text-neutral-400">
      <div className="animate-pulse font-bold text-sm">Loading...</div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="history" element={<Suspense fallback={Spinner}><History /></Suspense>} />
          <Route path="nutrition" element={<Suspense fallback={Spinner}><Nutrition /></Suspense>} />
          <Route path="programs" element={<Suspense fallback={Spinner}><Programs /></Suspense>} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/logger" element={<WorkoutLogger />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
        <Route path="/active-workout/:id" element={<Suspense fallback={Spinner}><ActiveWorkout /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
