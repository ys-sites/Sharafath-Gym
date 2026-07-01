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
  const [connectError, setConnectError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      setConnectError(false);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const response = await fetch('/api/session');
        if (!response.ok) throw new Error('Session request failed');
        const { access_token, refresh_token } = await response.json();
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) throw error;
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setConnectError(true);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
    return () => subscription.unsubscribe();
  }, []);

  if (connectError) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950 px-6">
        <div className="max-w-xs w-full text-center space-y-4">
          <p className="text-neutral-300 text-sm font-bold">Couldn't connect — pull to retry</p>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-sm font-semibold hover:bg-neutral-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-neutral-400 text-sm font-bold animate-pulse">Loading...</div>
      </div>
    );
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
