import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { Chrome, Shield, ArrowRight, Mail, Lock, ChevronRight } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sporter onboarding visual state
  const [started, setStarted] = useState(false);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!supabase) return;

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the login link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  if (!started) {
    return (
      <div className="h-screen w-full relative overflow-hidden font-sans text-white bg-black">
        {/* Full-bleed fitness background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800" 
            alt="Workout background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D12] via-[#0C0D12]/60 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 pb-16 max-w-md mx-auto">
          {/* Logo/Tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-4 w-max">
            Sharafath Gym
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none mb-4 bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            Workout That Gets Better As You Do
          </h1>

          {/* Description */}
          <p className="text-neutral-300 text-sm leading-relaxed mb-8 font-medium">
            Reach your fitness goals at home or in the gym with custom training programs, analytics, and live diary logging.
          </p>

          {/* Get Started Button Wrapper (Double-bezel look) */}
          <div className="bg-white/5 border border-white/10 p-1.5 rounded-full shadow-2xl">
            <button 
              onClick={() => setStarted(true)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full text-lg transition-all active:scale-[0.98] tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 group"
            >
              Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden font-sans text-white bg-[#0C0D12] flex items-center justify-center p-6">
      {/* Background glowing orb */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-sm z-10 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-neutral-400 text-sm font-medium">
            {isSignUp ? 'Enter details to start your journey' : 'Sign in to monitor your statistics'}
          </p>
        </div>

        {/* Double-Bezel Form Container */}
        <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-2xl">
          <form onSubmit={handleAuth} className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2.2rem-0.5rem)] p-6 space-y-4">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3.5 pl-10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="name@example.com"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3.5 pl-10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-medium bg-red-500/10 border border-red-500/25 p-3 rounded-xl">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
        </div>

        {/* Form Toggle Options */}
        <div className="space-y-4">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-neutral-400 hover:text-white text-xs font-bold transition-colors uppercase tracking-wider"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>

          {/* Social Sign-in simulation icons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button className="w-11 h-11 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all">
              <Chrome size={18} className="text-neutral-300" />
            </button>
            <button className="w-11 h-11 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all">
              <Shield size={18} className="text-neutral-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
