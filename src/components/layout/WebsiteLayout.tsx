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
  ChevronRight
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

  // Close mobile drawer on route change
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
    <div className="min-h-[100dvh] bg-[#090A0F] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Ambient Glow subtle accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[180px] bg-gradient-to-b from-amber-500/5 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Floating Glass Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#090A0F]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand / Logo */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group text-left transition-transform active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-amber-500/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:border-amber-400/60 transition-colors">
                <span className="font-serif text-lg font-bold text-amber-300">A</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif tracking-widest text-base font-bold uppercase text-zinc-100 group-hover:text-amber-300 transition-colors">
                    ASCENSION
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                    PHASE 2
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 tracking-wider">
                  Mohamed Sharafath • Performance Portal
                </p>
              </div>
            </button>

            {/* Desktop Center Goal Tracker Pill */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs shadow-inner">
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                <Award size={14} className="text-amber-400" />
                <span>Goal:</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-zinc-400">{startingWeight.toFixed(1)}kg</span>
                <span className="text-zinc-600">→</span>
                <span className="text-amber-300 font-semibold">{currentWeight.toFixed(1)}kg</span>
                <span className="text-zinc-600">→</span>
                <span className="text-emerald-400 font-semibold">{targetWeight.toFixed(1)}kg</span>
              </div>
              <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden ml-1">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                -{lostSoFar.toFixed(1)}kg ({progressPct}%)
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-zinc-800/90 text-amber-300 border border-zinc-700/60 shadow-sm' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'}
                    `}
                  >
                    <Icon size={15} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-zinc-800 bg-[#0c0d14] px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Goal pill on mobile */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400">Fat Loss Trajectory</span>
                <p className="text-xs font-mono font-medium text-zinc-200">
                  {startingWeight}kg → <span className="text-amber-300 font-bold">{currentWeight}kg</span> → {targetWeight}kg
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
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
                    flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold' 
                      : 'text-zinc-300 hover:bg-zinc-900'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-zinc-400" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Outlet />
      </main>

      {/* Website Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#06070a] text-zinc-400 text-xs py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-serif tracking-widest font-bold text-zinc-200">ASCENSION</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{SHARAFATH_PROFILE.name}</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Made by {SHARAFATH_PROFILE.coach} • {SHARAFATH_PROFILE.motto}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button 
              onClick={() => navigate('/blueprint')}
              className="hover:text-amber-300 transition-colors"
            >
              Master PDF Blueprint
            </button>
            <span className="text-zinc-700">•</span>
            <button 
              onClick={() => navigate('/progression')}
              className="hover:text-amber-300 transition-colors"
            >
              Progression Charts
            </button>
            <span className="text-zinc-700">•</span>
            <button 
              onClick={() => navigate('/weight')}
              className="hover:text-amber-300 transition-colors"
            >
              Weight Tracker
            </button>
            <span className="text-zinc-700">•</span>
            <button 
              onClick={() => navigate('/nutrition')}
              className="hover:text-amber-300 transition-colors"
            >
              Nutrition Blueprint
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
