import { useState, useEffect } from 'react';
import { Trophy, Clock, Calendar, ChevronRight, MoreVertical, Flame, Scale, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutSession } from '../types';

export default function History() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'daily'|'calendar'>('daily');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  const chartData = [
    { name: 'Sun', volume: 2000, active: false },
    { name: 'Mon', volume: 4000, active: false },
    { name: 'Tue', volume: 6500, active: true }, // Highlighted
    { name: 'Wed', volume: 1000, active: false },
    { name: 'Thu', volume: 8200, active: false },
    { name: 'Fri', volume: 4300, active: false },
    { name: 'Sat', volume: 9000, active: false },
  ];

  return (
    <div className="p-6 pb-24 font-sans bg-[#0F1015] min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pt-4">
        <div className="w-8"></div> {/* Spacer for center alignment */}
        <h1 className="text-xl font-bold">Progress</h1>
        <button className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-[#1A1A24] p-1 rounded-full flex mb-6 border border-neutral-800/50">
        <button 
          onClick={() => setView('daily')}
          className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${view === 'daily' ? 'bg-white text-black' : 'text-neutral-400'}`}
        >
          Daily
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${view === 'calendar' ? 'bg-white text-black' : 'text-neutral-400'}`}
        >
          Calendar
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Main Metric - Step/Volume Ring (mocked) */}
        <div className="row-span-2 bg-[#1A1A24] border border-neutral-800 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
           <div className="flex items-center gap-2 text-indigo-400 mb-4 z-10">
             <Activity size={18} />
             <span className="text-sm font-medium">Vol (lbs)</span>
           </div>
           
           <div className="flex-1 flex flex-col items-center justify-center relative z-10">
             {/* Mock Ring */}
             <div className="w-24 h-24 rounded-full border-[6px] border-neutral-800 relative flex items-center justify-center">
               <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="46" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="289" strokeDashoffset="80" strokeLinecap="round" />
               </svg>
               <span className="text-2xl font-bold">12k</span>
             </div>
           </div>
           
           <div className="mt-4 flex justify-between items-end text-xs text-neutral-400 z-10">
             <span>Average</span>
             <span className="font-bold text-white">8,500</span>
           </div>
           
           {/* Decorative background glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full"></div>
        </div>

        {/* Calories Card */}
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <Flame size={16} />
            <span className="text-xs font-medium">Calories</span>
          </div>
          <div>
            <div className="text-xl font-bold">1,024 <span className="text-xs text-neutral-500 font-medium">Kcal</span></div>
            <div className="text-xs text-neutral-400 mt-2 flex justify-between items-center">
              This week <ChevronRight size={12} />
            </div>
          </div>
        </div>

        {/* Weight Card */}
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Scale size={16} />
            <span className="text-xs font-medium">Weight</span>
          </div>
          <div>
            <div className="text-xl font-bold">65.0 <span className="text-xs text-neutral-500 font-medium">/ 75kg</span></div>
            <div className="text-xs text-neutral-400 mt-2 flex justify-between items-center">
              This week <ChevronRight size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Workout Chart */}
      <section className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-5 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Clock size={16} />
            <span className="font-semibold text-sm">Workout</span>
          </div>
          <button className="flex items-center text-xs text-neutral-400 font-medium">
            Week <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#262626'}}
                contentStyle={{ backgroundColor: '#0F1015', border: '1px solid #262626', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar 
                dataKey="volume" 
                radius={[6, 6, 6, 6]}
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  return (
                    <rect 
                      x={x} 
                      y={y} 
                      width={width} 
                      height={height} 
                      fill={payload.active ? '#6366f1' : '#262626'} 
                      rx={6} 
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Past Workouts */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Past Workouts</h2>
        {loading ? (
          <div className="text-center text-neutral-500 py-10">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-neutral-500 py-10 border border-dashed border-neutral-800 rounded-3xl">
            <Trophy size={48} className="mx-auto mb-3 opacity-20 text-indigo-500" />
            <p>No workouts recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="bg-[#1A1A24] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
                <div>
                  <h3 className="font-bold text-base mb-1">{session.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{session.created_at ? format(new Date(session.created_at), 'MMM d') : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDuration(session.active_duration_seconds)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-indigo-400">{session.total_volume} <span className="text-xs text-neutral-500">lbs</span></p>
                  </div>
                  <ChevronRight size={18} className="text-neutral-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
