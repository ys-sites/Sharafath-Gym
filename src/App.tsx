import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import History from './pages/History';
import Programs from './pages/Programs';
import Profile from './pages/Profile';
import WorkoutLogger from './pages/WorkoutLogger';
import Auth from './pages/Auth';
import Nutrition from './pages/Nutrition';
import WorkoutDetail from './pages/WorkoutDetail';
import ActiveWorkout from './pages/ActiveWorkout';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    const autoLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setLoading(false);
      } else {
        // Try to login with default personal credentials to bypass auth screen
        const email = 'sharafath2001@hotmail.com';
        const password = 'TrainTrackPassword123!';
        
        let { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // If login fails, try signing up the personal account
          const signUpRes = await supabase.auth.signUp({ email, password });
          setSession(signUpRes.data?.session);
        } else {
          setSession(data.session);
        }
        setLoading(false);
      }
    };
    
    autoLogin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">Loading TrainTrack...</div>;
  }

  // If Supabase is not configured, we should show a warning screen
  if (!supabase) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">TrainTrack Setup</h1>
        <p className="mb-6 text-neutral-400">
          Supabase environment variables are missing. Please add <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">VITE_SUPABASE_URL</code> and <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">VITE_SUPABASE_ANON_KEY</code> to your <code className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">.env</code> file.
        </p>
        <p className="text-sm text-neutral-500 max-w-md">
          This app requires a Supabase project with Postgres & Auth to persist your workout data across devices.
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
        {/* Logger is outside the standard layout (no bottom nav during workout) */}
        <Route path="/logger" element={<WorkoutLogger />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
        <Route path="/active-workout/:id" element={<ActiveWorkout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
