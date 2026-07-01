import { Play, TrendingUp, Bell, ChevronRight, Dumbbell, Heart, Activity, Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayMetrics, getDailySeries } from '../lib/health';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function Home() {
  const navigate = useNavigate();

  // Mock data for featured plan
  const featuredPlan = {
    title: "Massive Upper Body",
    stats: "5 week • 4x/week",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600",
  };

  const queryClient = useQueryClient();

  // 1. Fetch User Query
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await supabase.auth.getUser();
      return res.data.user;
    },
    staleTime: Infinity,
  });

  // 2. Fetch Health Data Query
  const { data: healthData, isLoading: isHealthLoading } = useQuery({
    queryKey: ['healthData', user?.id],
    queryFn: async () => {
      if (!user) return { hasHealthData: false, todaySteps: 0, todayCalories: 0, chartData: [] };

      const todayObj = await getTodayMetrics(user.id);
      const stepsData = await getDailySeries(user.id, 'steps', 14);
      const energyData = await getDailySeries(user.id, 'active_energy', 14);

      const hasSteps = stepsData.length > 0;
      const hasEnergy = energyData.length > 0;
      const hasToday = Object.keys(todayObj).length > 0;

      if (hasSteps || hasEnergy || hasToday) {
        const dateMap = new Map<string, { dateLabel: string; steps: number; calories: number }>();
        for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().substring(0, 10);
          const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dateMap.set(key, { dateLabel: label, steps: 0, calories: 0 });
        }

        for (const s of stepsData) {
          const key = s.day.substring(0, 10);
          const existing = dateMap.get(key);
          if (existing) {
            existing.steps = Math.round(s.value);
          }
        }

        for (const e of energyData) {
          const key = e.day.substring(0, 10);
          const existing = dateMap.get(key);
          if (existing) {
            existing.calories = Math.round(e.value);
          }
        }

        return {
          hasHealthData: true,
          todaySteps: todayObj.steps || 0,
          todayCalories: todayObj.active_energy || 0,
          chartData: Array.from(dateMap.values())
        };
      }

      return {
        hasHealthData: false,
        todaySteps: 0,
        todayCalories: 0,
        chartData: []
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
    retry: 1,
  });

  // 3. Fetch Water Data Query
  const { data: waterData, isLoading: isWaterLoading } = useQuery({
    queryKey: ['waterData', user?.id],
    queryFn: async () => {
      if (!user) return { waterGoal: 2500, todayWater: 0, lastWaterLogId: null };

      const { data: profile } = await supabase
        .from('profiles')
        .select('water_goal_ml')
        .eq('user_id', user.id)
        .maybeSingle();

      const goal = profile?.water_goal_ml || 2500;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('water_logs')
        .select('id, amount_ml')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay.toISOString())
        .order('logged_at', { ascending: false });

      const total = logs ? logs.reduce((sum, item) => sum + item.amount_ml, 0) : 0;
      const lastId = logs && logs.length > 0 ? logs[0].id : null;

      return {
        waterGoal: goal,
        todayWater: total,
        lastWaterLogId: lastId
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
    retry: 1,
  });

  // 4. Mutations
  const addWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error('No user authenticated');
      const { data, error } = await supabase
        .from('water_logs')
        .insert({
          user_id: user.id,
          amount_ml: amount
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterData', user?.id] });
    }
  });

  const undoWaterMutation = useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('water_logs')
        .delete()
        .eq('id', logId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterData', user?.id] });
    }
  });

  // Derived state values
  const todaySteps = healthData?.todaySteps || 0;
  const todayCalories = healthData?.todayCalories || 0;
  const chartData = healthData?.chartData || [];
  const hasHealthData = healthData?.hasHealthData || false;
  const loading = isHealthLoading || isWaterLoading;

  const waterGoal = waterData?.waterGoal || 2500;
  const todayWater = waterData?.todayWater || 0;
  const lastWaterLogId = waterData?.lastWaterLogId || null;

  const handleAddWater = (amount: number) => {
    addWaterMutation.mutate(amount);
  };

  const handleUndoWater = () => {
    if (lastWaterLogId) {
      undoWaterMutation.mutate(lastWaterLogId);
    }
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

      {/* Horizontal Calendar row matching Sporter UI Kit */}
      <section className="mb-8 overflow-x-auto flex gap-3 pb-2 scrollbar-none">
        {[
          { label: 'Sun', day: '28' },
          { label: 'Mon', day: '29' },
          { label: 'Tue', day: '30' },
          { label: 'Wed', day: '01', active: true },
          { label: 'Thu', day: '02' },
          { label: 'Fri', day: '03' },
          { label: 'Sat', day: '04' }
        ].map((item, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col items-center justify-center min-w-[52px] h-20 rounded-[1.2rem] border transition-all ${item.active ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_8px_20px_rgba(136,98,255,0.4)]' : 'bg-[#13141C] border-neutral-800/40 text-neutral-400'}`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{item.label}</span>
            <span className="text-base font-extrabold mt-1">{item.day}</span>
          </div>
        ))}
      </section>

      {/* Apple Health Activity Section */}
      <section className="mb-8 text-left">
        {loading ? (
          <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-xl">
            <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-8 border border-neutral-800/30 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : !hasHealthData ? (
          /* Empty State linking to Profile */
          <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-xl">
            <div 
              onClick={() => navigate('/profile')}
              className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-6 border border-neutral-800/30 text-center cursor-pointer hover:border-indigo-500/20 transition-colors group"
            >
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                <Heart size={22} className="fill-red-500" />
              </div>
              <h4 className="font-extrabold text-base text-white mb-1.5 group-hover:text-indigo-300 transition-colors">Connect Apple Health</h4>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                Sync steps, workouts, and nutrition automatically. Tap here to configure connection.
              </p>
            </div>
          </div>
        ) : (
          /* Health Data Dashboard */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Steps Card */}
              <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
                <div className="bg-[#13141C] rounded-[calc(2rem-0.375rem)] p-5 border border-neutral-800/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl"></div>
                  <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase block mb-1">Steps Today</span>
                  <p className="text-2xl font-extrabold text-white">{todaySteps.toLocaleString()}</p>
                  <span className="text-[10px] text-teal-400 font-extrabold mt-1.5 block">Daily Goal: 10,000</span>
                </div>
              </div>

              {/* Active Energy Card */}
              <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
                <div className="bg-[#13141C] rounded-[calc(2rem-0.375rem)] p-5 border border-neutral-800/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl"></div>
                  <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase block mb-1">Calories Burned</span>
                  <p className="text-2xl font-extrabold text-white">{todayCalories} kcal</p>
                  <span className="text-[10px] text-orange-400 font-extrabold mt-1.5 block">Active energy</span>
                </div>
              </div>
            </div>

            {/* 14-day Trend Chart */}
            <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-2xl">
              <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-5 border border-neutral-800/30">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-extrabold text-neutral-400 tracking-wide uppercase">14-Day Activity Trends</span>
                </div>
                <div className="h-40 w-full text-[10px] font-medium text-neutral-400">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="dateLabel" stroke="#404040" tickLine={false} axisLine={false} />
                      <YAxis stroke="#404040" tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#13141C', borderColor: '#262626', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="steps" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSteps)" name="Steps" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Water Tracker Card */}
      <section className="mb-8 text-left">
        <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-teal-500/5 to-transparent"></div>
          
          <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-6 border border-neutral-800/30 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full">
                <Droplet size={14} className="fill-teal-400" />
                <span className="font-bold text-xs uppercase tracking-wider">Water Intake</span>
              </div>
              {lastWaterLogId && (
                <button 
                  onClick={handleUndoWater}
                  className="text-xs text-neutral-400 font-bold hover:text-white hover:underline transition-colors active:scale-95"
                >
                  Undo Last
                </button>
              )}
            </div>

            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase block tracking-wider">Today's Total</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-white">{todayWater}</span>
                  <span className="text-xs font-bold text-neutral-400">/ {waterGoal} ml</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-2 py-1 rounded-lg">
                {Math.round(Math.min((todayWater / waterGoal) * 100, 100))}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-neutral-900 border border-neutral-800/60 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${Math.min((todayWater / waterGoal) * 100, 100)}%` }}
              />
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleAddWater(250)}
                className="py-3 bg-neutral-900 border border-neutral-800/80 hover:border-teal-500/30 rounded-2xl text-xs font-bold text-neutral-300 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Droplet size={12} className="text-teal-400 fill-teal-400" />
                +250 ml
              </button>
              <button 
                onClick={() => handleAddWater(500)}
                className="py-3 bg-neutral-900 border border-neutral-800/80 hover:border-teal-500/30 rounded-2xl text-xs font-bold text-neutral-300 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Droplet size={12} className="text-teal-400 fill-teal-400" />
                +500 ml
              </button>
            </div>
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
