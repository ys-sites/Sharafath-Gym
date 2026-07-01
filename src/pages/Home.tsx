import { Play, TrendingUp, Bell, ChevronRight, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  // Mock data for featured plan
  const featuredPlan = {
    title: "Massive Upper Body",
    stats: "5 week • 4x/week",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600",
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="p-6 pb-32 bg-[#0C0D12] min-h-screen text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-10 pt-6">
        <div>
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-3.5">
            {today}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            Good Morning, Sharafath!
          </h1>
        </div>
        
        {/* Double-bezel small avatar/bell button */}
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-[1.2rem] shadow-xl">
          <button className="w-11 h-11 rounded-[calc(1.2rem-0.375rem)] border border-neutral-800/40 flex items-center justify-center bg-[#15161E] relative active:scale-95 transition-transform group">
            <Bell size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-indigo-500 rounded-full border border-[#15161E] animate-pulse"></span>
          </button>
        </div>
      </header>

      {/* Calories / Activity Widget (Double-Bezel Card) */}
      <section className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] mb-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
        
        <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-6 border border-neutral-800/30 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
              <TrendingUp size={14} />
              <span className="font-bold text-xs uppercase tracking-wider">Calories burned</span>
            </div>
            <button className="flex items-center gap-1 text-xs text-neutral-400 font-bold hover:text-white active:scale-95 transition-all">
              This Week <ChevronRight size={14} className="text-indigo-400" />
            </button>
          </div>
          
          {/* Mock Bar Chart */}
          <div className="flex items-end justify-between h-36 pb-2 relative">
            {[40, 55, 85, 30, 20, 60, 45].map((height, i) => {
              const isToday = i === 2;
              return (
                <div key={i} className="flex flex-col items-center gap-2.5 z-10 flex-1">
                  {isToday && (
                    <div className="bg-indigo-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg absolute top-0 -translate-y-2 shadow-lg shadow-indigo-500/30 border border-indigo-400/40">
                      236 kcal
                    </div>
                  )}
                  <div 
                    className={`w-7 rounded-lg transition-all duration-500 cursor-pointer ${isToday ? 'bg-indigo-500 shadow-[0_0_20px_rgba(136,98,255,0.6)] border border-indigo-400/50' : 'bg-neutral-800 hover:bg-neutral-700'}`} 
                    style={{ height: `${height}%` }}
                  />
                  <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-400 font-extrabold' : 'text-neutral-500'}`}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Start Action (Double-Bezel CTA Card) */}
      <section className="mb-8">
        <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-2xl">
          <div 
            onClick={() => navigate('/logger')}
            className="bg-indigo-500 rounded-[calc(2.2rem-0.5rem)] p-6 flex items-center justify-between cursor-pointer active:scale-[0.98] hover:scale-[1.01] transition-all duration-300 shadow-xl group border border-indigo-400/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">Start Empty Workout</h2>
              <p className="text-indigo-100 text-sm opacity-80 font-medium">Log exercise sets, weights, and reps</p>
            </div>
            
            {/* Button-in-button container */}
            <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
              <Play size={20} className="fill-black ml-1 text-black" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Plan Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-extrabold text-white tracking-tight">Featured Training</h3>
          <button onClick={() => navigate('/programs')} className="text-sm text-indigo-400 font-bold hover:text-indigo-300 active:scale-95 transition-all">See all</button>
        </div>
        
        {/* Double-bezel featured plan card */}
        <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-2xl">
          <div className="relative rounded-[calc(2.2rem-0.5rem)] overflow-hidden h-52 bg-neutral-900 border border-neutral-800/30 cursor-pointer group">
            <img 
              src={featuredPlan.image} 
              alt={featuredPlan.title} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D12]/90 via-[#0C0D12]/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end z-10">
              <div>
                <h4 className="text-2xl font-extrabold text-white mb-2 tracking-tight group-hover:text-indigo-300 transition-colors">{featuredPlan.title}</h4>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full text-neutral-300 backdrop-blur-md border border-white/10">
                  <Dumbbell size={12} className="text-indigo-400" /> {featuredPlan.stats}
                </span>
              </div>
              
              {/* Button trailing arrow */}
              <button className="bg-white text-black font-extrabold px-6 py-3 rounded-full hover:bg-indigo-400 hover:text-white transition-all flex items-center gap-1.5 shadow-lg active:scale-95">
                Start <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
