import { useState } from 'react';
import { Trophy, Clock, Calendar, ChevronRight, MoreVertical, Flame, Scale, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DAY_MS = 24 * 60 * 60 * 1000;

export default function History() {
  const [view, setView] = useState<'daily' | 'calendar'>('daily');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
    staleTime: Infinity,
  });

  const { data: sessions = [], isLoading: loading } = useQuery({
    queryKey: ['workoutSessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 30000,
    retry: 1,
  });

  const { data: todayCalories = 0 } = useQuery({
    queryKey: ['todayCalories', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const start = startOfDay(new Date());
      const end = endOfDay(new Date());
      const { data } = await supabase
        .from('meals')
        .select('meal_items ( calories )')
        .eq('user_id', user.id)
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString());
      return (data || []).reduce((sum: number, meal: any) => (
        sum + (meal.meal_items || []).reduce((s: number, item: any) => s + (item.calories || 0), 0)
      ), 0);
    },
    enabled: !!user?.id,
  });

  const { data: weightInfo } = useQuery({
    queryKey: ['weightInfo', user?.id],
    queryFn: async () => {
      if (!user) return { current: null, target: null };
      const [{ data: latest }, { data: profile }] = await Promise.all([
        supabase
          .from('health_metrics')
          .select('value')
          .eq('user_id', user.id)
          .eq('type', 'weight')
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('target_weight_kg')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);
      return { current: latest?.value ?? null, target: profile?.target_weight_kg ?? null };
    },
    enabled: !!user?.id,
  });

  const formatDuration = (seconds: number) => {
    const m = Math.floor((seconds || 0) / 60);
    return `${m} min`;
  };

  // --- Weekly summary: rolling 7-day windows ---
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * DAY_MS);
  const fourteenDaysAgo = new Date(now - 14 * DAY_MS);

  const getSessionDate = (s: any) => new Date(s.start_time || s.created_at);

  const thisWeekSessions = sessions.filter((s: any) => getSessionDate(s) >= sevenDaysAgo);
  const lastWeekSessions = sessions.filter((s: any) => {
    const d = getSessionDate(s);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });

  const summarize = (list: any[]) => {
    const completed = list.filter(s => s.status === 'completed');
    return {
      count: completed.length,
      volume: completed.reduce((sum, s) => sum + (Number(s.total_volume) || 0), 0),
      duration: completed.reduce((sum, s) => sum + (Number(s.active_duration_seconds) || 0), 0),
    };
  };

  const thisWeek = summarize(thisWeekSessions);
  const lastWeek = summarize(lastWeekSessions);

  const DeltaBadge = ({ current, previous }: { current: number; previous: number }) => {
    if (previous === 0 && current === 0) return null;
    const diff = current - previous;
    const pct = previous > 0 ? Math.round((diff / previous) * 100) : (current > 0 ? 100 : 0);
    if (diff === 0) {
      return <span className="flex items-center gap-0.5 text-neutral-500 text-[10px] font-bold"><Minus size={10} /> 0%</span>;
    }
    const isUp = diff > 0;
    return (
      <span className={`flex items-center gap-0.5 text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {Math.abs(pct)}%
      </span>
    );
  };

  // --- Rolling 7-day volume chart, oldest -> newest, today highlighted ---
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const dayStart = startOfDay(subDays(new Date(), 6 - i));
    const dayEnd = endOfDay(dayStart);
    const dayVolume = sessions
      .filter((s: any) => s.status === 'completed' && getSessionDate(s) >= dayStart && getSessionDate(s) <= dayEnd)
      .reduce((sum: number, s: any) => sum + (Number(s.total_volume) || 0), 0);
    return {
      name: format(dayStart, 'EEE'),
      volume: dayVolume,
      active: i === 6,
    };
  });

  const weekVolumeAvg = thisWeek.count > 0 ? Math.round(thisWeek.volume / thisWeek.count) : 0;

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

      {/* Weekly Summary Widget */}
      <section className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-5 mb-6">
        <div className="flex items-center gap-2 text-indigo-400 mb-4">
          <Trophy size={16} />
          <span className="font-semibold text-sm">Weekly Summary</span>
          <span className="text-[10px] text-neutral-500 font-medium ml-auto">vs previous 7 days</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Sessions</div>
            <div className="text-xl font-extrabold">{thisWeek.count}</div>
            <DeltaBadge current={thisWeek.count} previous={lastWeek.count} />
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Volume (kg)</div>
            <div className="text-xl font-extrabold">{Math.round(thisWeek.volume).toLocaleString()}</div>
            <DeltaBadge current={thisWeek.volume} previous={lastWeek.volume} />
          </div>
          <div>
            <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Duration</div>
            <div className="text-xl font-extrabold">{formatDuration(thisWeek.duration)}</div>
            <DeltaBadge current={thisWeek.duration} previous={lastWeek.duration} />
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Main Metric - Weekly Volume */}
        <div className="row-span-2 bg-[#1A1A24] border border-neutral-800 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
           <div className="flex items-center gap-2 text-indigo-400 mb-4 z-10">
             <Activity size={18} />
             <span className="text-sm font-medium">Vol (kg)</span>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center relative z-10">
             <div className="w-24 h-24 rounded-full border-[6px] border-neutral-800 relative flex items-center justify-center">
               <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                 <circle
                   cx="50" cy="50" r="46" fill="none" stroke="#6366f1" strokeWidth="8"
                   strokeDasharray="289"
                   strokeDashoffset={lastWeek.volume > 0 ? Math.max(0, 289 - Math.min(1, thisWeek.volume / (lastWeek.volume || 1)) * 289) : (thisWeek.volume > 0 ? 0 : 289)}
                   strokeLinecap="round"
                 />
               </svg>
               <span className="text-xl font-bold">{thisWeek.volume >= 1000 ? `${(thisWeek.volume / 1000).toFixed(1)}k` : Math.round(thisWeek.volume)}</span>
             </div>
           </div>

           <div className="mt-4 flex justify-between items-end text-xs text-neutral-400 z-10">
             <span>Avg / session</span>
             <span className="font-bold text-white">{weekVolumeAvg.toLocaleString()}</span>
           </div>

           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full"></div>
        </div>

        {/* Calories Card */}
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <Flame size={16} />
            <span className="text-xs font-medium">Calories</span>
          </div>
          <div>
            <div className="text-xl font-bold">{Math.round(todayCalories).toLocaleString()} <span className="text-xs text-neutral-500 font-medium">Kcal</span></div>
            <div className="text-xs text-neutral-400 mt-2">Today</div>
          </div>
        </div>

        {/* Weight Card */}
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Scale size={16} />
            <span className="text-xs font-medium">Weight</span>
          </div>
          <div>
            <div className="text-xl font-bold">
              {weightInfo?.current != null ? Number(weightInfo.current).toFixed(1) : '--'}
              <span className="text-xs text-neutral-500 font-medium"> / {weightInfo?.target != null ? `${weightInfo.target}kg` : '--'}</span>
            </div>
            <div className="text-xs text-neutral-400 mt-2">Latest logged</div>
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
          <span className="text-xs text-neutral-500 font-medium">Last 7 days</span>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{fill: '#262626'}}
                contentStyle={{ backgroundColor: '#0F1015', border: '1px solid #262626', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${Math.round(value)} kg`, 'Volume']}
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
                      height={height || 2}
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
            {sessions.map((session: any) => (
              <div key={session.id} className="bg-[#1A1A24] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base">{session.name}</h3>
                    {session.status && session.status !== 'completed' && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {session.status === 'in_progress' ? 'In progress' : 'Incomplete'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{session.start_time ? format(new Date(session.start_time), 'MMM d') : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDuration(session.active_duration_seconds)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-indigo-400">{Math.round(session.total_volume || 0)} <span className="text-xs text-neutral-500">kg</span></p>
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
