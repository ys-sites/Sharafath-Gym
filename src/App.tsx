import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import WorkoutLogger from './pages/WorkoutLogger';
import Auth from './pages/Auth';
import WorkoutDetail from './pages/WorkoutDetail';
import { supabase } from './lib/supabase';

// Route-level code splitting with React.lazy
const History = lazy(() => import('./pages/History'));
const Programs = lazy(() => import('./pages/Programs'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout'));

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    const checkSession = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      setSession(activeSession);
      setLoading(false);
    };
    
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">Loading Sharafath Gym...</div>;
  }

  // If Supabase is not configured, we should show a warning screen
  if (!supabase) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">Sharafath Gym Setup</h1>
        <p className="mb-6 text-neutral-400">
          Supabase environment variables are missing. Please add <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">VITE_SUPABASE_URL</code> and <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">VITE_SUPABASE_ANON_KEY</code> to your <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">.env</code> file.
        </p>
        <p className="text-sm text-neutral-500 max-w-md">
          This app requires a Supabase project with Postgres & Auth to persist your workout data across devices.
        </p>
      </div>
    );
  }

  // Security Hardening: Gate access via Auth screen if session is not active
  if (!session) {
    return <Auth />;
  }

  const LoadingPlaceholder = (
    <div className="h-screen flex items-center justify-center bg-[#0C0D12] text-neutral-400">
      <div className="animate-pulse font-bold text-sm">Loading...</div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="history" element={
            <Suspense fallback={LoadingPlaceholder}>
              <History />
            </Suspense>
          } />
          <Route path="nutrition" element={
            <Suspense fallback={LoadingPlaceholder}>
              <Nutrition />
            </Suspense>
          } />
          <Route path="programs" element={
            <Suspense fallback={LoadingPlaceholder}>
              <Programs />
            </Suspense>
          } />
          <Route path="profile" element={<Profile />} />
        </Route>
        {/* Logger is outside the standard layout (no bottom nav during workout) */}
        <Route path="/logger" element={<WorkoutLogger />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
        <Route path="/active-workout/:id" element={
          <Suspense fallback={LoadingPlaceholder}>
            <ActiveWorkout />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
