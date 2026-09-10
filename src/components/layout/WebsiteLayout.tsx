import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BookOpen, 
  Scale, 
  UtensilsCrossed, 
  Menu, 
  X, 
  Sparkles,
  Award,
  ChevronRight,
  Shield,
  Flame
} from 'lucide-react';
import { GYM_DATA } from '../../data/gymHistoryData';
import { SHARAFATH_PROFILE } from '../../data/blueprintData';

export default function WebsiteLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const startingWeight = SHARAFATH_PROFILE.startingWeightKg; // 82.0
  const targetWeight = SHARAFATH_PROFILE.goalWeightKg; // 75.0
  const latestWeightEntry = GYM_DATA.weights[GYM_DATA.weights.length - 1];
  const currentWeight = latestWeightEntry ? latestWeightEntry.weightKg : 80.1;
  const totalToLose = startingWeight - targetWeight; // 7.0
  const lostSoFar = Math.max(0, startingWeight - currentWeight); // 1.9
  const progressPct = Math.min(100, Math.round((lostSoFar / totalToLose) * 100));

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Overview', icon: Sparkles },
    { to: '/progression', label: 'Progression Charts', icon: TrendingUp },
    { to: '/blueprint', label: 'Master Blueprint', icon: BookOpen },
    { to: '/weight', label: 'Weight & Body', icon: Scale },
    { to: '/nutrition', label: 'Nutrition & Macros', icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#06070a] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200 relative overflow-x-hidden">
      {/* Cinematic Ambient Atmosphere */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[340px] bg-gradient-to-b from-amber-500/[0.07] via-amber-500/[0.02] to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-60 w-[500px] h-[500px] bg-indigo-500/[0.03] blur-[150px] pointer-events-none -z-10" />

      {/* Detached Floating Island Navbar */}
      <div className="sticky top-4 z-50 w-full px-4 sm:px-6 max-w-6xl mx-auto">
        <header className="glass-island rounded-full px-4 sm:px-6 py-3 transition-all duration-500">
          <div className="flex items-center justify-between gap-4">
            {/* Brand Crest */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group text-left transition-transform active:scale-[0.98]"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-amber-500/40 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:border-amber-400 transition-colors">
                <span className="font-serif text-base sm:text-lg font-bold text-amber-300">A</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif tracking-[0.2em] text-sm sm:text-base font-bold uppercase text-white group-hover:text-amber-300 transition-colors">
                    ASCENSION
                  </span>
                  <span className="hidden sm:inline-flex text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">
                    Phase 2
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 tracking-wider hidden sm:block">
                  Mohamed Sharafath • 75kg Target
                </p>
              </div>
            </button>

            {/* Center: Weight Milestone Island Badge */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/40 border border-white/[0.06] text-xs shadow-inner">
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
                <span>82.0kg</span>
                <span className="text-zinc-600">→</span>
                <span className="text-amber-300 font-bold">{currentWeight.toFixed(1)}kg</span>
                <span className="text-zinc-600">→</span>
                <span className="text-emerald-400 font-bold">{targetWeight.toFixed(1)}kg</span>
              </div>
              <div className="w-16 bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                -{lostSoFar.toFixed(1)}kg
              </span>
            </div>

            {/* Navigation Pill Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `
                      flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                      ${isActive 
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'}
                    `}
                  >
                    <Icon size={14} className="stroke-[2]" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Menu Morph Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-3xl glass-island border border-white/10 space-y-2 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Mobile Goal Preview */}
            <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Goal Progress</span>
                <span className="text-xs font-mono font-bold text-white">
                  82.0kg → <span className="text-amber-300">{currentWeight.toFixed(1)}kg</span> → 75.0kg
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                -{lostSoFar.toFixed(1)}kg
              </span>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-medium transition-all
                    ${isActive 
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold' 
                      : 'text-zinc-300 hover:bg-white/[0.04]'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-zinc-400" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-600" />
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Outlet />
      </main>

      {/* Luxury Editorial Footer */}
      <footer className="border-t border-zinc-900 bg-[#040507] text-zinc-400 text-xs py-12 mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-serif tracking-[0.25em] font-bold text-white uppercase text-sm">
                ASCENSION
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-400 font-mono text-[11px]">
                {SHARAFATH_PROFILE.name}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Coaching Blueprint by {SHARAFATH_PROFILE.coach} • {SHARAFATH_PROFILE.motto}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-400">
            <button 
              onClick={() => navigate('/blueprint')}
              className="hover:text-amber-300 transition-colors"
            >
              Master Blueprint
            </button>
            <span className="text-zinc-800">•</span>
            <button 
              onClick={() => navigate('/progression')}
              className="hover:text-amber-300 transition-colors"
            >
              Progression Charts
            </button>
            <span className="text-zinc-800">•</span>
            <button 
              onClick={() => navigate('/weight')}
              className="hover:text-amber-300 transition-colors"
            >
              Weight Tracker
            </button>
            <span className="text-zinc-800">•</span>
            <button 
              onClick={() => navigate('/nutrition')}
              className="hover:text-amber-300 transition-colors"
            >
              Nutrition Protocol
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
