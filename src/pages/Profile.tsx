import { Trophy, Clock, Calendar, ChevronRight, Activity, TrendingUp, TrendingDown, Target, Settings, Crown, LogOut } from 'lucide-react';
import { useState } from 'react';
import WeightLoggerModal from '../components/profile/WeightLoggerModal';

export default function Profile() {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(() => {
    const saved = localStorage.getItem('user_weight');
    return saved ? parseFloat(saved) : 84;
  });

  return (
    <div className="p-6 pb-24 font-sans bg-[#0F1015] min-h-screen text-white">
      <div className="flex justify-between items-center mb-6 pt-4">
        <h1 className="text-xl font-bold">Profile</h1>
        <button className="text-neutral-400 hover:text-white p-2 rounded-full transition-colors">
          <Settings size={24} />
        </button>
      </div>
      
      {/* Profile Header */}
      <div className="bg-[#1A1A24] border border-neutral-800 rounded-[32px] p-6 mb-6 text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent"></div>
        <div className="w-24 h-24 bg-neutral-800 rounded-full mx-auto mb-4 border-4 border-[#1A1A24] relative z-10 flex items-center justify-center text-4xl font-bold text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          S
        </div>
        <h2 className="text-2xl font-bold text-white relative z-10 mb-1">Sharafath</h2>
        <p className="text-neutral-400 text-sm mb-4">Goal: Fat Loss (75kg, leaner physique)</p>
        
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 px-4 py-2 rounded-full text-yellow-500 text-sm font-bold">
          <Crown size={16} />
          PRO Member
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div 
          onClick={() => setIsWeightModalOpen(true)}
          className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-transform hover:border-indigo-500/50"
        >
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
            <Activity size={18} />
          </div>
          <span className="text-sm font-medium text-neutral-400 mb-1">Current Weight</span>
          <p className="text-2xl font-bold text-white">{currentWeight} kg</p>
        </div>
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-3xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 relative z-10 border border-indigo-500/20">
            <Target size={18} />
          </div>
          <span className="text-sm font-medium text-neutral-400 mb-1 relative z-10">Target Weight</span>
          <p className="text-2xl font-bold text-white relative z-10">75 kg</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-4">Key Rules</h3>
      <div className="space-y-3 mb-8">
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-2xl p-4 flex gap-4 items-start">
          <div className="mt-0.5 text-indigo-400 bg-indigo-500/10 p-2 rounded-full"><Check size={16} /></div>
          <div>
            <h4 className="font-bold text-base text-white">Consistency over Intensity</h4>
            <p className="text-sm text-neutral-400 mt-1 leading-relaxed">Focus on showing up 3x/week before worrying about lifting heavier.</p>
          </div>
        </div>
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-2xl p-4 flex gap-4 items-start">
          <div className="mt-0.5 text-indigo-400 bg-indigo-500/10 p-2 rounded-full"><Check size={16} /></div>
          <div>
            <h4 className="font-bold text-base text-white">Light Practice Sets</h4>
            <p className="text-sm text-neutral-400 mt-1 leading-relaxed">First set of every exercise is a light practice set. Focus on feeling the muscle.</p>
          </div>
        </div>
        <div className="bg-[#1A1A24] border border-neutral-800 rounded-2xl p-4 flex gap-4 items-start">
          <div className="mt-0.5 text-indigo-400 bg-indigo-500/10 p-2 rounded-full"><Check size={16} /></div>
          <div>
            <h4 className="font-bold text-base text-white">10k-15k Daily Steps</h4>
            <p className="text-sm text-neutral-400 mt-1 leading-relaxed">Increase daily activity to support fat loss without impacting recovery.</p>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button className="w-full bg-[#1A1A24] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between text-red-500 font-bold active:scale-[0.98] transition-transform">
        <span>Sign Out</span>
        <LogOut size={20} />
      </button>

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
