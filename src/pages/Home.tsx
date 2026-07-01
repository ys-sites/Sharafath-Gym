import { Play, TrendingUp, Calendar, Trophy, Bell, ChevronRight, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  // Mock data for featured plan
  const featuredPlan = {
    title: "Massive Upper Body",
    stats: "5 week • 4x/week",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600",
  };

  return (
    <div className="p-6 pb-32 font-sans bg-[#0F1015] min-h-screen text-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 pt-4">
        <div>
          <p className="text-sm font-medium text-neutral-400 mb-1">Fri, 03 March</p>
          <h1 className="text-2xl font-bold">Good Morning, Sharafath!</h1>
        </div>
        <button className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center bg-[#1A1A24] relative">
          <Bell size={20} className="text-neutral-300" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1A1A24]"></span>
        </button>
      </header>

      {/* Calories / Activity Widget */}
      <section className="bg-[#1A1A24] rounded-3xl p-5 mb-6 border border-neutral-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <TrendingUp size={18} />
            <span className="font-semibold text-sm">Calories</span>
          </div>
          <button className="flex items-center text-xs text-neutral-400 font-medium">
            Week <ChevronRight size={14} />
          </button>
        </div>
        
        {/* Mock Bar Chart */}
        <div className="flex items-end justify-between h-32 pb-6 relative">
          {[40, 55, 85, 30, 20, 60, 45].map((height, i) => {
            const isToday = i === 2;
            return (
              <div key={i} className="flex flex-col items-center gap-2 z-10">
                {isToday && (
                  <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded absolute top-0 -translate-y-2">
                    236 kcal
                  </div>
                )}
                <div 
                  className={`w-8 rounded-md transition-all ${isToday ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-neutral-800'}`} 
                  style={{ height: `${height}%` }}
                />
                <span className={`text-[10px] font-medium ${isToday ? 'text-indigo-400' : 'text-neutral-500'}`}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Start Action */}
      <section className="mb-8">
        <div 
          onClick={() => navigate('/logger')}
          className="bg-indigo-500 rounded-3xl p-5 flex items-center justify-between cursor-pointer active:scale-95 transition-transform shadow-[0_8px_30px_rgba(99,102,241,0.25)]"
        >
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Start Empty Workout</h2>
            <p className="text-indigo-100 text-sm opacity-80">Log your own exercises</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play size={24} className="text-white fill-white ml-1" />
          </div>
        </div>
      </section>

      {/* Featured Plan */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Featured plan</h3>
          <button onClick={() => navigate('/programs')} className="text-sm text-indigo-400 font-medium">See all</button>
        </div>
        
        <div className="relative rounded-3xl overflow-hidden h-48 bg-neutral-900 border border-neutral-800 cursor-pointer group">
          <img 
            src={featuredPlan.image} 
            alt={featuredPlan.title} 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1015] via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-5 w-full">
            <h4 className="text-xl font-bold text-white mb-1">{featuredPlan.title}</h4>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium bg-neutral-800/80 px-2 py-1 rounded-md text-neutral-300 flex items-center gap-1 backdrop-blur-sm">
                <Dumbbell size={12} /> {featuredPlan.stats}
              </span>
            </div>
            <button className="bg-white text-black text-sm font-bold px-6 py-2 rounded-full w-28 hover:bg-neutral-200 transition-colors">
              Start
            </button>
          </div>
        </div>
      </section>


    </div>
  );
}
