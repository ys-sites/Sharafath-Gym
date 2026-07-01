import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const autoLogin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const email = import.meta.env.VITE_DEFAULT_EMAIL || 'sharafath2001@hotmail.com';
          const password = import.meta.env.VITE_DEFAULT_PASSWORD || 'TrainTrackPassword123!';
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            await supabase.auth.signUp({ email, password });
          }
        }
      } catch (e) {
        console.error('Auth error:', e);
      } finally {
        setLoading(false);
      }
    };

    autoLogin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">Loading Sharafath Gym...</div>;
  }

  if (!supabase) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">Sharafath Gym Setup</h1>
        <p className="mb-6 text-neutral-400">
          Add <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">VITE_SUPABASE_URL</code> and <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">VITE_SUPABASE_ANON_KEY</code> to your <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">.env</code> file.
        </p>
      </div>
    );
  }

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
