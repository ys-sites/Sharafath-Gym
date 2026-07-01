import { Trophy, Clock, Calendar, ChevronRight, Activity, TrendingUp, TrendingDown, Target, Settings, Crown, LogOut, Heart, Copy, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
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
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [savingTargets, setSavingTargets] = useState(false);
  const [message, setMessage] = useState('');

  const [isAppleHealthConnected, setIsAppleHealthConnected] = useState(false);
  const [showHealthKitPermissions, setShowHealthKitPermissions] = useState(false);
  const [stepsSyncedToday, setStepsSyncedToday] = useState(0);
  const [caloriesSyncedToday, setCaloriesSyncedToday] = useState(0);
  const [lastHealthSync, setLastHealthSync] = useState('');
  const [userId, setUserId] = useState('your-user-id');
  const [syncToken, setSyncToken] = useState('');
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [weightChange, setWeightChange] = useState<number | null>(null);

  const fetchWeightHistory = async () => {
    if (!supabase) return;
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data, error } = await supabase
        .from('health_metrics')
        .select('value, start_date')
        .eq('user_id', user.id)
        .eq('type', 'weight')
        .gte('start_date', ninetyDaysAgo.toISOString())
        .order('start_date', { ascending: true });

      if (!error && data) {
        const formatted = data.map(item => {
          const d = new Date(item.start_date);
          return {
            value: Number(item.value),
            dateStr: `${d.getMonth() + 1}/${d.getDate()}`,
            rawDate: d
          };
        });
        setWeightHistory(formatted);

        if (formatted.length >= 2) {
          const latest = formatted[formatted.length - 1];
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const oldLog = formatted.find(item => item.rawDate >= thirtyDaysAgo);
          if (oldLog && oldLog !== latest) {
            setWeightChange(Number((latest.value - oldLog.value).toFixed(1)));
          } else {
            const first = formatted[0];
            setWeightChange(Number((latest.value - first.value).toFixed(1)));
          }
        }
      }
    } catch (e) {
      console.error('Error fetching weight history:', e);
    }
  };

  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleRegenerateToken = async () => {
    if (!supabase) return;
    setIsRegeneratingToken(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      
      const newToken = generateUUID();
      const { error } = await supabase
        .from('profiles')
        .update({ sync_token: newToken })
        .eq('user_id', user.id);
        
      if (!error) {
        setSyncToken(newToken);
        alert('Sync token regenerated successfully!');
      } else {
        alert('Failed to regenerate token: ' + error.message);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setIsRegeneratingToken(false);
    }
  };

  const handleSendTestPing = async () => {
    setIsTestingPing(true);
    setPingResult(null);
    try {
      const edgeUrl = "https://mnhwaljzcqfqtnfaivso.supabase.co/functions/v1/health-sync";
      const payload = {
        user_id: userId,
        sync_token: syncToken,
        metrics: [
          {
            type: "steps",
            value: 0,
            unit: "count",
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(edgeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setPingResult({ success: true, message: "Test ping successful! Sent 0 steps to Edge Function." });
        if (supabase) {
          const user = (await supabase.auth.getUser()).data.user;
          if (user) {
            const { data } = await supabase
              .from('profiles')
              .select('last_health_sync')
              .eq('user_id', user.id)
              .single();
            if (data?.last_health_sync) {
              setLastHealthSync(data.last_health_sync);
            }
          }
        }
      } else {
        setPingResult({ success: false, message: `Ping failed: ${resData.error || res.statusText}` });
      }
    } catch (err: any) {
      setPingResult({ success: false, message: `Error sending ping: ${err.message}` });
    } finally {
      setIsTestingPing(false);
    }
  };

  const copyToClipboard = (text: string, flagSetter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    flagSetter(true);
    setTimeout(() => flagSetter(false), 2000);
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

  useEffect(() => {
    const getUid = async () => {
      if (supabase) {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) setUserId(user.id);
      }
    };
    getUid();
  }, []);

  const handleConnectAppleHealth = async () => {
    if (isAppleHealthConnected) {
      setIsAppleHealthConnected(false);
      setStepsSyncedToday(0);
      setCaloriesSyncedToday(0);
      setLastHealthSync('');
      if (supabase) {
        try {
          const user = (await supabase.auth.getUser()).data.user;
          if (user) {
            await supabase.from('profiles').update({
              apple_health_connected: false,
              steps_synced_today: 0,
              calories_synced_today: 0,
              last_health_sync: null
            }).eq('user_id', user.id);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setShowHealthKitPermissions(true);
    }
  };

  const handleAllowHealthKit = async () => {
    setIsAppleHealthConnected(true);
    setShowHealthKitPermissions(false);
    if (supabase) {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          await supabase.from('profiles').update({
            apple_health_connected: true
          }).eq('user_id', user.id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    const fetchTargets = async () => {
      if (!supabase) return;
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;
        
        let { data, error } = await supabase
          .from('profiles')
          .select('daily_calorie_target, protein_target_g, carbs_target_g, fats_target_g, apple_health_connected, steps_synced_today, calories_synced_today, last_health_sync, sync_token')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
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
            
          if (newProfile) {
            setCalorieTarget(newProfile.daily_calorie_target);
            setProteinTarget(newProfile.protein_target_g);
            setCarbsTarget(newProfile.carbs_target_g);
            setFatsTarget(newProfile.fats_target_g);
            setSyncToken(newProfile.sync_token || '');
          }
        } else if (data) {
          setCalorieTarget(data.daily_calorie_target);
          setProteinTarget(data.protein_target_g);
          setCarbsTarget(data.carbs_target_g);
          setFatsTarget(data.fats_target_g);
          setIsAppleHealthConnected(!!data.apple_health_connected);
          setStepsSyncedToday(data.steps_synced_today || 0);
          setCaloriesSyncedToday(data.calories_synced_today || 0);
          setLastHealthSync(data.last_health_sync || '');
          setSyncToken(data.sync_token || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTargets(false);
        fetchWeightHistory();
      }
    };
    
    fetchTargets();
  }, []);

  const saveTargets = async () => {
    if (!supabase) return;
    setSavingTargets(true);
    setMessage('');
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          daily_calorie_target: Number(calorieTarget),
          protein_target_g: Number(proteinTarget),
          carbs_target_g: Number(carbsTarget),
          fats_target_g: Number(fatsTarget)
        });

      if (error) throw error;
      setMessage('Targets saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage('Failed to save targets.');
    } finally {
      setSavingTargets(false);
    }
  };

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
            <p className="text-2xl font-extrabold text-white relative z-10">75 kg</p>
          </div>
        </div>
      </div>

      {/* Weight Trend Section */}
      {weightHistory.length > 0 && (
        <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] mb-8 shadow-2xl">
          <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-6 border border-neutral-800/30">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h4 className="font-extrabold text-sm text-white">Weight Trend (90 Days)</h4>
                <p className="text-[11px] text-neutral-500 font-bold mt-0.5 uppercase tracking-wide">Manual logs & HealthKit logs</p>
              </div>
              {weightChange !== null && (
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                  weightChange < 0 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {weightChange < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  <span>{weightChange > 0 ? `+${weightChange}` : weightChange} kg</span>
                  <span className="text-[10px] text-neutral-500 font-medium ml-0.5">Change</span>
                </div>
              )}
            </div>
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#525252" fontSize={9} tickLine={false} />
                  <YAxis stroke="#525252" fontSize={9} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#13141C', border: '1px solid #262626', borderRadius: '12px' }}
                    labelStyle={{ color: '#a3a3a3', fontWeight: 'bold', fontSize: '10px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

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
            <div className="bg-black/30 border border-neutral-800/50 rounded-2xl p-4 mt-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
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

              {/* Sync Status Badge */}
              <div className="flex justify-between text-xs font-bold text-neutral-400 border-t border-neutral-800/40 pt-2.5">
                <span>Status</span>
                {(() => {
                  if (!lastHealthSync) return <span className="text-neutral-500 font-extrabold uppercase tracking-wide">Never synced</span>;
                  const diff = Date.now() - new Date(lastHealthSync).getTime();
                  if (diff < 26 * 60 * 60 * 1000) {
                    return <span className="text-emerald-500 font-extrabold uppercase tracking-wide">Active</span>;
                  }
                  return (
                    <span className="text-amber-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle size={12} /> Sync may have stopped
                    </span>
                  );
                })()}
              </div>

              <div className="border-t border-neutral-800/60 pt-3.5 space-y-3 text-left">
                <span className="text-[11px] font-extrabold text-neutral-400 block tracking-wide uppercase">Setup iOS Auto-Sync Guide</span>
                
                {/* Endpoint Section */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Edge Function Webhook URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://mnhwaljzcqfqtnfaivso.supabase.co/functions/v1/health-sync"
                      className="w-full bg-neutral-900 border border-neutral-800/60 rounded-xl px-2.5 py-1.5 text-[9px] font-mono text-indigo-400 focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard("https://mnhwaljzcqfqtnfaivso.supabase.co/functions/v1/health-sync", setCopiedUrl)}
                      className="px-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    >
                      {copiedUrl ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Token Section */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Your Personal Sync Token</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={syncToken || "Loading token..."}
                      className="w-full bg-neutral-900 border border-neutral-800/60 rounded-xl px-2.5 py-1.5 text-[9px] font-mono text-neutral-300 focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(syncToken, setCopiedToken)}
                      className="px-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    >
                      {copiedToken ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                    <button
                      onClick={handleRegenerateToken}
                      disabled={isRegeneratingToken}
                      className="px-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors disabled:opacity-55"
                      title="Regenerate Token"
                    >
                      <RefreshCw size={12} className={isRegeneratingToken ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>

                {/* Step guide */}
                <p className="text-[11px] text-neutral-500 leading-normal font-medium">
                  Configure Apple Health syncing in the iOS Shortcuts App:
                </p>
                <ol className="list-decimal pl-4 text-[10px] text-neutral-400 space-y-1.5 font-medium">
                  <li>Open the iOS <strong>Shortcuts</strong> App and go to the <strong>Automation</strong> tab.</li>
                  <li>Create a new automation running daily (e.g., 9:00 PM).</li>
                  <li>Add <strong>"Find Health Samples"</strong> for both <strong>Steps</strong> and <strong>Active Energy</strong> (Group by: Day, Sum, Limit: Today).</li>
                  <li>Add <strong>"Get Contents of URL"</strong> action targeting the Webhook URL above, set method to <strong>POST</strong>.</li>
                  <li>Configure Request Body as <strong>JSON</strong> with:
                    <code className="block bg-neutral-900 border border-neutral-800/60 rounded p-2 mt-1 font-mono text-[8px] text-neutral-300 whitespace-pre-wrap leading-relaxed select-all">
{`{
  "user_id": "${userId}",
  "sync_token": "${syncToken || "<your-token>"}",
  "metrics": [
    {
      "type": "steps",
      "value": StepsValue,
      "unit": "count",
      "start_date": "TodayDateISO",
      "end_date": "TodayDateISO"
    },
    {
      "type": "active_energy",
      "value": CaloriesValue,
      "unit": "kcal",
      "start_date": "TodayDateISO",
      "end_date": "TodayDateISO"
    }
  ]
}`}
                    </code>
                  </li>
                  <li>Toggle off <strong>"Ask Before Running"</strong> to let it sync seamlessly in the background.</li>
                </ol>

                {/* Test Ping Container */}
                <div className="border-t border-neutral-800/40 pt-3 space-y-2">
                  <button
                    onClick={handleSendTestPing}
                    disabled={isTestingPing || !syncToken}
                    className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isTestingPing ? (
                      <>
                        <RefreshCw size={11} className="animate-spin" /> Sending Test Ping...
                      </>
                    ) : (
                      'Send Test Ping'
                    )}
                  </button>
                  {pingResult && (
                    <p className={`text-[10px] font-bold text-center ${pingResult.success ? 'text-emerald-500' : 'text-red-500'}`}>
                      {pingResult.message}
                    </p>
                  )}
                </div>

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

function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
