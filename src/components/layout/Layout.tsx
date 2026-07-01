import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, BarChart2, BookOpen, User, Plus } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hide global FAB on nutrition page since it has its own
  const showGlobalFab = location.pathname !== '/nutrition';

  return (
    <div className="flex flex-col h-screen bg-[#0F1015] text-neutral-50 overflow-hidden font-sans">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* FAB for starting workout - absolute positioned above the nav */}
      {showGlobalFab && (
        <div className="fixed bottom-24 right-6 z-50">
          <button 
            onClick={() => navigate('/logger')}
            className="flex items-center justify-center w-14 h-14 bg-indigo-500 text-white rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.4)] active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>
      )}

      <nav className="fixed bottom-0 w-full h-20 bg-[#1A1A24] border-t border-neutral-800/50 flex items-center justify-around px-2 pb-2 z-40">
        <NavItem to="/" icon={<Home size={22} />} label="Home" />
        <NavItem to="/programs" icon={<Search size={22} />} label="Search" />
        <NavItem to="/history" icon={<BarChart2 size={22} />} label="Progress" />
        <NavItem to="/nutrition" icon={<BookOpen size={22} />} label="Advice" />
        <NavItem to="/profile" icon={<User size={22} />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-16 h-full gap-1 text-[10px] font-medium transition-colors relative",
          isActive ? "text-indigo-400" : "text-neutral-400 hover:text-neutral-300"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator dot */}
          {isActive && (
            <div className="absolute top-1 w-1 h-1 bg-indigo-500 rounded-full" />
          )}
          <div className={isActive ? "mt-2" : ""}>
            {icon}
          </div>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
