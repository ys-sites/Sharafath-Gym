import { Trophy, Clock, Calendar, ChevronRight, Activity, TrendingUp, TrendingDown, Target, Settings, Crown, LogOut, Heart, Copy, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import WeightLoggerModal from '../components/profile/WeightLoggerModal';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(() => {
    const saved = localStorage.getItem('user_weight');
    return saved ? parseFloat(saved) : 84;
  });

  const [calorieTarget, setCalorieTarget] = useState(2200);
  const [proteinTarget, setProteinTarget] = useState(160);
  const [carbsTarget, setCarbsTarget] = useState(300);
  const [fatsTarget, setFatsTarget] = useState(60);
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [message, setMessage] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [isShortcutAccordionOpen, setIsShortcutAccordionOpen] = useState(false);
  const [showHealthKitPermissions, setShowHealthKitPermissions] = useState(false);

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

  // 2. Fetch Profile targets query
  const { data: profileData, isLoading: loadingTargets } = useQuery({
    queryKey: ['profileTargets', user?.id],
    queryFn: async () => {
      if (!user) return null;
      let { data, error } = await supabase
        .from('profiles')
        .select('daily_calorie_target, protein_target_g, carbs_target_g, fats_target_g, apple_health_connected, steps_synced_today, calories_synced_today, last_health_sync, sync_token, target_weight_kg')
        .eq('user_id', user.id)
        .single();
          
      if (error && error.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            daily_calorie_target: 2200,
            protein_target_g: 160,
            carbs_target_g: 300,
            fats_target_g: 60
          })
          .select()
          .single();
        return newProfile;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30000,
    retry: 1,
  });

  // Load target inputs once fetched
  useEffect(() => {
    if (profileData) {
      setCalorieTarget(profileData.daily_calorie_target);
      setProteinTarget(profileData.protein_target_g);
      setCarbsTarget(profileData.carbs_target_g);
      setFatsTarget(profileData.fats_target_g);
      setTargetWeight(profileData.target_weight_kg ? String(profileData.target_weight_kg) : '');
    }
  }, [profileData]);

  // Fetch Weight History for Chart (last 90 days)
  const { data: weightHistory = [] } = useQuery({
    queryKey: ['weightHistory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data, error } = await supabase
        .from('health_metrics')
        .select('start_date, value')
        .eq('user_id', user.id)
        .eq('type', 'weight')
        .gte('start_date', ninetyDaysAgo.toISOString())
        .order('start_date', { ascending: true });

      if (error) {
        console.error("Error fetching weight history:", error);
        return [];
      }
      return (data || []).map((d: any) => ({
        date: new Date(d.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: d.value,
        rawDate: d.start_date
      }));
    },
    enabled: !!user?.id
  });

  // Derived state values
  const userId = user?.id || 'your-user-id';
  const syncToken = profileData?.sync_token || 'loading-sync-token...';
  const isAppleHealthConnected = !!profileData?.apple_health_connected;
  const stepsSyncedToday = profileData?.steps_synced_today || 0;
  const caloriesSyncedToday = profileData?.calories_synced_today || 0;
  const lastHealthSync = profileData?.last_health_sync || '';

  // 3. Mutations
  const saveTargetsMutation = useMutation({
    mutationFn: async (targets: { daily_calorie_target: number; protein_target_g: number; carbs_target_g: number; fats_target_g: number; target_weight_kg: number | null }) => {
      if (!user) throw new Error('No user authenticated');
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...targets
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileTargets', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['weightHistory', user?.id] });
      setMessage('Targets saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    },
    onError: () => {
      setMessage('Failed to save targets.');
    }
  });

  const updateAppleHealthMutation = useMutation({
    mutationFn: async (payload: { apple_health_connected: boolean; steps_synced_today?: number; calories_synced_today?: number; last_health_sync?: string | null }) => {
      if (!user) throw new Error('No user authenticated');
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileTargets', user?.id] });
    }
  });

  const saveTargets = () => {
    saveTargetsMutation.mutate({
      daily_calorie_target: Number(calorieTarget),
      protein_target_g: Number(proteinTarget),
      carbs_target_g: Number(carbsTarget),
      fats_target_g: Number(fatsTarget),
      target_weight_kg: targetWeight ? Number(targetWeight) : null
    });
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      const [
        { data: sessions },
        { data: allSets },
        { data: meals },
        { data: waterLogs },
        { data: healthMetrics }
      ] = await Promise.all([
        supabase.from('workout_sessions').select('*').eq('user_id', user.id).order('start_time', { ascending: false }),
        supabase.from('sets').select(`
          *,
          session_exercises!inner (
            id,
            session_id,
            exercises ( name )
          )
        `),
        supabase.from('meals').select('*, meal_items(*)').eq('user_id', user.id).order('logged_at', { ascending: false }),
        supabase.from('water_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }),
        supabase.from('health_metrics').select('*').eq('user_id', user.id).order('start_date', { ascending: false })
      ]);

      const exportJson = {
        exported_at: new Date().toISOString(),
        profile: {
          user_id: user.id,
          daily_calorie_target: calorieTarget,
          protein_target_g: proteinTarget,
          carbs_target_g: carbsTarget,
          fats_target_g: fatsTarget,
          target_weight_kg: targetWeight ? Number(targetWeight) : null
        },
        workouts: sessions || [],
        sets: allSets || [],
        meals: meals || [],
        water: waterLogs || [],
        weight_and_health_metrics: healthMetrics || []
      };

      const jsonBlob = new Blob([JSON.stringify(exportJson, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `traintrack_export_${user.id}_${Date.now()}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);

      let csvContent = "Session Name,Category,Date,Duration (min),Volume (kg)\n";
      (sessions || []).forEach((s: any) => {
        const dateStr = s.start_time ? new Date(s.start_time).toLocaleDateString() : '';
        const durationMin = s.active_duration_seconds ? Math.round(s.active_duration_seconds / 60) : 0;
        const name = (s.name || '').replace(/"/g, '""');
        const category = (s.category || '').replace(/"/g, '""');
        csvContent += `"${name}","${category}","${dateStr}",${durationMin},${s.total_volume || 0}\n`;
      });

      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const csvLink = document.createElement('a');
      csvLink.href = csvUrl;
      csvLink.download = `traintrack_workout_history_${user.id}_${Date.now()}.csv`;
      document.body.appendChild(csvLink);
      csvLink.click();
      document.body.removeChild(csvLink);
      URL.revokeObjectURL(csvUrl);

    } catch (err) {
      console.error("Export data failed:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleConnectAppleHealth = async () => {
    if (isAppleHealthConnected) {
      updateAppleHealthMutation.mutate({
        apple_health_connected: false,
        steps_synced_today: 0,
        calories_synced_today: 0,
        last_health_sync: null
      });
    } else {
      setShowHealthKitPermissions(true);
    }
  };

  const handleAllowHealthKit = () => {
    setShowHealthKitPermissions(false);
    updateAppleHealthMutation.mutate({
      apple_health_connected: true
    });
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(console.error);
  };

  const handleSendTestPing = async () => {
    setPingLoading(true);
    setPingResult(null);
    const functionUrl = 'https://mnhwaljzcqfqtnfaivso.supabase.co/functions/v1/health-sync';
    try {
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-sync-token': syncToken
        },
        body: JSON.stringify({
          user_id: userId,
          sync_token: syncToken,
          type: 'steps',
          value: 0,
          unit: 'count',
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPingResult(`Success! Processed: ${data.processed || 0} metrics.`);
        queryClient.invalidateQueries({ queryKey: ['profileTargets', user?.id] });
      } else {
        setPingResult(`Error: ${data.error || 'Request failed'}`);
      }
    } catch (err: any) {
      setPingResult(`Network Error: ${err.message}`);
    } finally {
      setPingLoading(false);
    }
  };

  const formatLastSync = (timestamp: string) => {
    if (!timestamp) return 'Never synced yet';
    try {
      const d = new Date(timestamp);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Never synced yet';
    }
  };

  const savingTargets = saveTargetsMutation.isPending;
  const targetWeightVal = profileData?.target_weight_kg ? Number(profileData.target_weight_kg) : null;
  const weightToGo = targetWeightVal ? currentWeight - targetWeightVal : null;
  const weightToGoLabel = weightToGo !== null 
    ? weightToGo > 0 
      ? `${weightToGo.toFixed(1)} kg to go` 
      : "Goal reached! 🎉"
    : null;

  return (
    <div className="p-6 pb-24 bg-[#0C0D12] min-h-screen text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-6">
        <h1 className="text-3xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Profile
        </h1>
        
        {/* Double-bezel Settings Button */}
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-[1.2rem] shadow-xl">
          <button className="w-11 h-11 rounded-[calc(1.2rem-0.375rem)] border border-neutral-800/40 flex items-center justify-center bg-[#15161E] active:scale-95 transition-transform hover:text-white text-neutral-400">
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      {/* Profile Header (Double-Bezel Card) */}
      <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] mb-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent"></div>
        
        <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-8 border border-neutral-800/30 relative z-10 text-center">
          <div className="w-24 h-24 bg-neutral-800 rounded-full mx-auto mb-5 border-4 border-[#13141C] relative z-10 flex items-center justify-center text-4xl font-extrabold text-indigo-400 shadow-[0_0_25px_rgba(136,98,255,0.25)]">
            S
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">Sharafath</h2>
          <p className="text-neutral-400 text-sm font-medium mb-5">Goal: Fat Loss (75kg, leaner physique)</p>
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/25 px-4 py-2 rounded-full text-yellow-500 text-xs font-extrabold tracking-wider uppercase">
            <Crown size={14} className="animate-bounce" />
            PRO Member
          </div>
        </div>
      </div>

      {/* Stats Grid (Double-Bezel cards) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Current Weight */}
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
          <div 
            onClick={() => setIsWeightModalOpen(true)}
            className="bg-[#13141C] rounded-[calc(2rem-0.375rem)] p-5 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-transform hover:border-indigo-500/30 border border-neutral-800/30 h-full"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-800/80 border border-neutral-700/30 flex items-center justify-center text-neutral-400 mb-3.5">
              <Activity size={18} />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase mb-1">Current Weight</span>
            <p className="text-2xl font-extrabold text-white">{currentWeight} kg</p>
          </div>
        </div>

        {/* Target Weight */}
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2rem] shadow-xl">
          <div className="bg-[#13141C] rounded-[calc(2rem-0.375rem)] p-5 flex flex-col items-center justify-center text-center border border-neutral-800/30 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl"></div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3.5 relative z-10">
              <Target size={18} />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase mb-1 relative z-10">Target Weight</span>
            <p className="text-2xl font-extrabold text-white relative z-10">
              {profileData?.target_weight_kg ? `${profileData.target_weight_kg} kg` : '75 kg'}
            </p>
          </div>
        </div>
      </div>

      {/* Weight progression Chart (Double-Bezel Card) */}
      <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] mb-8 shadow-2xl">
        <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-6 border border-neutral-800/30">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">Weight Progression</span>
              <h4 className="font-extrabold text-base text-white">90-Day Trend</h4>
            </div>
            {weightToGoLabel && (
              <span className="bg-orange-500/10 text-orange-500 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-orange-500/20">
                {weightToGoLabel}
              </span>
            )}
          </div>

          <div className="h-48 w-full mt-2">
            {weightHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-neutral-500 font-bold border border-dashed border-neutral-800/40 rounded-2xl p-4">
                <span>No logged weight history yet</span>
                <span className="text-[10px] text-neutral-600 font-normal mt-1">Weight entries will appear here once logged.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 3', 'dataMax + 3']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#13141C', borderColor: '#27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '10px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  {targetWeightVal && (
                    <ReferenceLine 
                      y={targetWeightVal} 
                      stroke="#f97316" 
                      strokeDasharray="4 4" 
                      label={{ value: `Goal: ${targetWeightVal}kg`, fill: '#f97316', fontSize: 9, position: 'top' }}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#818cf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-white tracking-tight mb-5 px-1">Daily Calorie & Macro Targets</h3>
      <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] mb-8 shadow-2xl">
        <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-6 border border-neutral-800/30 space-y-4">
          {loadingTargets ? (
            <p className="text-neutral-400 text-sm animate-pulse text-center py-4">Loading targets...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(Number(e.target.value))}
                    className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Protein (g)</label>
                  <input
                    type="number"
                    value={proteinTarget}
                    onChange={(e) => setProteinTarget(Number(e.target.value))}
                    className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbsTarget}
                    onChange={(e) => setCarbsTarget(Number(e.target.value))}
                    className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                 <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Fats (g)</label>
                  <input
                    type="number"
                    value={fatsTarget}
                    onChange={(e) => setFatsTarget(Number(e.target.value))}
                    className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="E.g. 75"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {message && (
                <p className={`text-xs font-bold text-center ${message.includes('success') ? 'text-indigo-400' : 'text-red-500'}`}>
                  {message}
                </p>
              )}

              <button
                onClick={saveTargets}
                disabled={savingTargets}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-3 rounded-2xl transition-all active:scale-[0.98] text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {savingTargets ? 'Saving...' : 'Save Targets'}
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-white tracking-tight mb-5 px-1">Integrations</h3>
      <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] mb-8 shadow-2xl">
        <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-6 border border-neutral-800/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Apple Health Premium Icon Container */}
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                <Heart size={22} className="fill-red-500" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Apple Health</h4>
                <p className="text-[11px] text-neutral-500 font-bold mt-0.5 uppercase tracking-wide">Sync steps & calories</p>
              </div>
            </div>
            
            <button
              onClick={handleConnectAppleHealth}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] ${
                isAppleHealthConnected 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
              }`}
            >
              {isAppleHealthConnected ? 'Connected' : 'Connect'}
            </button>
          </div>

          {isAppleHealthConnected && (
            <div className="bg-black/30 border border-neutral-800/50 rounded-2xl p-4 mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
              <div className="flex justify-between text-xs font-bold text-neutral-400">
                <span>Last Sync</span>
                <span className="text-indigo-400 font-extrabold">{formatLastSync(lastHealthSync)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-neutral-400 border-t border-neutral-800/40 pt-2.5">
                <span>Steps Synced Today</span>
                <span className="text-white font-extrabold">{stepsSyncedToday.toLocaleString()} steps</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-neutral-400 border-t border-neutral-800/40 pt-2.5">
                <span>Active Energy (Cal)</span>
                <span className="text-white font-extrabold">{caloriesSyncedToday} kcal</span>
              </div>

              {/* Health Auto Export Guide & Inputs */}
              <div className="border-t border-neutral-800/60 pt-4 space-y-3">
                <span className="text-[11px] font-extrabold text-indigo-400 block tracking-wide uppercase">Setup Health Auto Export (iOS App)</span>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
                  Configure dynamic automatic health backups from your iPhone:
                </p>
                <ul className="list-disc pl-4 text-[10px] text-neutral-500 space-y-1 font-medium">
                  <li>Install <strong>Health Auto Export</strong> from the App Store.</li>
                  <li>Go to <strong>Automated Exports</strong> &rarr; <strong>New Automation</strong> &rarr; select <strong>REST API</strong>.</li>
                  <li>Export format: <strong>JSON</strong>. Select metrics: <strong>Steps</strong>, <strong>Active Energy</strong>, <strong>Weight</strong>.</li>
                </ul>

                {/* API URL and Header Credentials Inputs */}
                <div className="space-y-2.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-wider block">Endpoint URL</label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value="https://mnhwaljzcqfqtnfaivso.supabase.co/functions/v1/health-sync" 
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-[10px] font-mono text-neutral-300 focus:outline-none"
                      />
                      <button 
                        onClick={() => handleCopyToClipboard("https://mnhwaljzcqfqtnfaivso.supabase.co/functions/v1/health-sync", "url")}
                        className="px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/50 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                      >
                        {copiedField === 'url' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-wider block">Header: x-user-id</label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={userId} 
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-[10px] font-mono text-neutral-300 focus:outline-none"
                      />
                      <button 
                        onClick={() => handleCopyToClipboard(userId, "userId")}
                        className="px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/50 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                      >
                        {copiedField === 'userId' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-wider block">Header: x-sync-token</label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={syncToken} 
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-[10px] font-mono text-neutral-300 focus:outline-none"
                      />
                      <button 
                        onClick={() => handleCopyToClipboard(syncToken, "syncToken")}
                        className="px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/50 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                      >
                        {copiedField === 'syncToken' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[9px] text-neutral-500 italic leading-relaxed">
                  Note: The endpoint only accepts POST requests. Opening this URL in a browser will show a method error, which is expected.
                </p>

                {/* Test Connection Button */}
                <div className="pt-2">
                  <button 
                    disabled={pingLoading}
                    onClick={handleSendTestPing}
                    className="w-full py-2.5 bg-[#15161E] hover:bg-neutral-800/40 border border-neutral-800/80 rounded-xl text-xs font-bold text-neutral-300 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
                  >
                    {pingLoading ? <RefreshCw size={14} className="animate-spin text-indigo-400" /> : null}
                    Send test ping (steps=0)
                  </button>
                  {pingResult && (
                    <div className={`mt-2 p-2.5 rounded-xl text-[10px] font-mono leading-normal ${pingResult.startsWith('Success') ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-400' : 'bg-red-950/40 border border-red-500/20 text-red-400'}`}>
                      {pingResult}
                    </div>
                  )}
                </div>
              </div>

              {/* iOS Shortcuts Accordion */}
              <div className="border-t border-neutral-800/60 pt-4">
                <button 
                  onClick={() => setIsShortcutAccordionOpen(!isShortcutAccordionOpen)}
                  className="w-full flex items-center justify-between text-[11px] font-extrabold text-neutral-400 uppercase tracking-wide hover:text-white transition-colors"
                >
                  <span>Advanced: iOS Shortcuts Integration</span>
                  <ChevronDown size={14} className={`transform transition-transform ${isShortcutAccordionOpen ? 'rotate-180' : ''}`} />
                </button>
                {isShortcutAccordionOpen && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                      Configure a custom Shortcut to sync steps and energy metrics with this JSON payload format:
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center pl-1">
                        <span className="text-[9px] font-bold text-neutral-500 uppercase">Shortcuts JSON body</span>
                        <button 
                          onClick={() => handleCopyToClipboard(JSON.stringify({ user_id: userId, sync_token: syncToken, steps: 0, calories: 0 }), "shortcutJson")}
                          className="text-[9px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {copiedField === 'shortcutJson' ? 'Copied!' : 'Copy Schema'}
                        </button>
                      </div>
                      <pre className="bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-[9px] font-mono text-neutral-400 overflow-x-auto">
{`{
  "user_id": "${userId}",
  "sync_token": "${syncToken}",
  "steps": 10000,
  "calories": 450
}`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* iOS-Style Native HealthKit Permissions Dialog */}
      {showHealthKitPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-6" onClick={() => setShowHealthKitPermissions(false)}>
          <div className="bg-[#1C1C1E] border border-neutral-800/40 rounded-[2.5rem] overflow-hidden max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full mx-auto flex items-center justify-center">
                <Heart size={28} className="fill-red-500" />
              </div>
              <h3 className="font-extrabold text-xl text-white">Access Health Data</h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-medium">
                "Sharafath Gym" would like to access and update your Health app data to sync your daily activity progress.
              </p>
              
              <div className="border-t border-neutral-800/80 pt-4 space-y-3.5 text-left max-h-[160px] overflow-y-auto px-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white font-bold">Steps Count</span>
                  <div className="w-9 h-5 bg-indigo-500 rounded-full relative flex items-center justify-end px-0.5 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-neutral-850/60 pt-2.5">
                  <span className="text-xs text-white font-bold">Active Energy (Calories)</span>
                  <div className="w-9 h-5 bg-indigo-500 rounded-full relative flex items-center justify-end px-0.5 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-neutral-850/60 pt-2.5">
                  <span className="text-xs text-white font-bold">Workouts</span>
                  <div className="w-9 h-5 bg-indigo-500 rounded-full relative flex items-center justify-end px-0.5 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 border-t border-neutral-800/80 pt-4">
                <button 
                  onClick={() => setShowHealthKitPermissions(false)}
                  className="w-full bg-neutral-900 border border-neutral-850 text-neutral-400 font-extrabold py-3.5 rounded-2xl active:scale-95 transition-transform text-xs uppercase tracking-wider"
                >
                  Don't Allow
                </button>
                <button 
                  onClick={handleAllowHealthKit}
                  className="w-full bg-red-500 text-white font-extrabold py-3.5 rounded-2xl active:scale-95 transition-transform text-xs uppercase tracking-wider shadow-lg shadow-red-500/20"
                >
                  Allow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Ownership */}
      <h3 className="text-lg font-extrabold text-white tracking-tight mb-5 px-1">Data Ownership</h3>
      <div className="bg-white/5 border border-white/10 p-1.5 rounded-[1.8rem] shadow-xl mb-8">
        <div className="bg-[#13141C] rounded-[calc(1.8rem-0.375rem)] p-5 border border-neutral-800/30 space-y-4">
          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
            Download a full copy of your health and training data. Export includes complete workouts history, recorded sets, meal logs, water logs, tracked weight, and general health metrics.
          </p>
          <button 
            onClick={handleExportData}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-2xl active:scale-[0.98] transition-all text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <Download size={14} /> Export My Data (JSON & CSV)
          </button>
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-white tracking-tight mb-5 px-1">Key Rules</h3>
      
      {/* Key Rules list with Double Bezel cards */}
      <div className="space-y-4 mb-8">
        {[
          { title: "Consistency over Intensity", desc: "Focus on showing up 3x/week before worrying about lifting heavier." },
          { title: "Light Practice Sets", desc: "First set of every exercise is a light practice set. Focus on feeling the muscle." },
          { title: "10k-15k Daily Steps", desc: "Increase daily activity to support fat loss without impacting recovery." }
        ].map((rule, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 p-1.5 rounded-[1.8rem] shadow-xl">
            <div className="bg-[#13141C] rounded-[calc(1.8rem-0.375rem)] p-5 flex gap-4 items-start border border-neutral-800/30">
              <div className="mt-0.5 text-indigo-400 bg-indigo-500/10 p-2 rounded-full border border-indigo-500/20 flex-shrink-0">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white tracking-tight">{rule.title}</h4>
                <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out Button (Double-Bezel format) */}
      <div className="bg-white/5 border border-white/10 p-1.5 rounded-[1.8rem] shadow-xl">
        <button className="w-full bg-[#13141C] border border-neutral-800/30 hover:bg-neutral-800/50 rounded-[calc(1.8rem-0.375rem)] p-4 flex items-center justify-between text-red-500 font-extrabold active:scale-[0.98] transition-transform">
          <span>Sign Out</span>
          <LogOut size={18} />
        </button>
      </div>

      {isWeightModalOpen && (
        <WeightLoggerModal 
          onClose={() => setIsWeightModalOpen(false)} 
          currentWeight={currentWeight}
          onSave={(newWeight) => {
            setCurrentWeight(newWeight);
            setIsWeightModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
