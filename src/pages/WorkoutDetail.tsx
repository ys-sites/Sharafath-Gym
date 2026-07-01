import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share, MoreHorizontal, ArrowDown, Play, Heart, RefreshCw, X, Edit2, ArrowLeftRight, Navigation, Trash2 } from 'lucide-react';

export default function WorkoutDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Mock data for the circuit
  const circuits = [
    {
      id: 1,
      name: 'CIRCUIT 1',
      rounds: 2,
      exercises: [
        { id: '1a', name: 'Dumbbell Bench Press', details: '20, 15 Reps', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=200' },
        { id: '1b', name: 'Dumbbell Chest Fly', details: '15, 12 Reps', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200' },
        { id: '1c', name: 'Dumbbell Single Arm Bent Over Row', details: '15, 12 Each Side', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=200' },
        { id: '1d', name: 'Dumbbell Alternating Press', details: '15, 12 Each Side', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=200' },
      ]
    },
    {
      id: 2,
      name: 'CIRCUIT 2',
      rounds: 1,
      exercises: [
        { id: '2a', name: 'Treadmill 2.0 Incline Run', details: '60 Seconds', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200' }
      ]
    }
  ];

  return (
    <div className="bg-[#0F1015] min-h-screen text-white font-sans flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0F1015]/90 backdrop-blur-md px-4 py-4 border-b border-neutral-800">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold tracking-wider uppercase">CHEST & BACK <span className="text-neutral-500">›</span></h1>
          </div>
          <div className="w-10"></div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 bg-[#1A1A24] rounded-xl py-3 flex items-center justify-center gap-2 font-medium text-sm text-neutral-300">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex-1 bg-[#1A1A24] rounded-xl py-3 flex items-center justify-center gap-2 font-medium text-sm text-neutral-300">
            <Heart size={16} /> Save
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {circuits.map((circuit, cIdx) => (
          <div key={circuit.id} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-neutral-400 tracking-wider uppercase">{circuit.name}</h2>
              <button className="text-neutral-500">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <div className="bg-[#1A1A24] rounded-3xl p-4 pl-6 relative">
              {/* Vertical line connecting exercises */}
              <div className="absolute left-10 top-10 bottom-10 w-[1px] bg-orange-500/30 z-0"></div>
              
              <div className="space-y-6 relative z-10">
                {circuit.exercises.map((ex, eIdx) => (
                  <div key={ex.id} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 rounded-lg bg-neutral-800 overflow-hidden shrink-0">
                        <img src={ex.img} alt={ex.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-base leading-tight pr-8">{ex.name}</h3>
                        <p className="text-sm text-neutral-400 mt-0.5">{ex.details}</p>
                      </div>
                      <button 
                        onClick={() => setActiveMenu(ex.id)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-500"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                    {eIdx < circuit.exercises.length - 1 && (
                      <div className="flex justify-center w-20 mt-4 text-orange-500">
                        <ArrowDown size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Transition to next circuit */}
            {cIdx < circuits.length - 1 && (
              <div className="flex items-center mt-4">
                <div className="w-16 flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
                </div>
                <div className="flex-1 text-sm text-neutral-500">Move to Next Circuit</div>
                <div className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-md text-xs font-bold">
                  {circuit.rounds} Rounds
                </div>
              </div>
            )}
            {cIdx === circuits.length - 1 && (
               <div className="flex justify-end mt-4">
                  <div className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-md text-xs font-bold">
                    {circuit.rounds} Round{circuit.rounds > 1 ? 's' : ''}
                  </div>
               </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#0F1015] z-20 pb-8">
        <button 
          onClick={() => navigate(`/active-workout/${id}`)}
          className="w-full bg-[#FF6B35] hover:bg-[#FF8555] text-white font-bold py-4 rounded-xl text-lg transition-all active:scale-[0.98] tracking-widest uppercase"
        >
          START
        </button>
      </div>

      {/* Option Menu Overlay */}
      {activeMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveMenu(null)}>
          <div className="bg-[#1A1A24] w-full rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Dumbbell Bench Press</h3>
              <button onClick={() => setActiveMenu(null)} className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <button className="w-full flex items-center gap-4 p-2 text-left">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Edit2 size={20} />
                </div>
                <div>
                  <div className="font-bold text-white">Edit Reps</div>
                  <div className="text-sm text-neutral-400">Easily adjust reps</div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-4 p-2 text-left">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <ArrowLeftRight size={20} />
                </div>
                <div>
                  <div className="font-bold text-white">Alternate Exercise</div>
                  <div className="text-sm text-neutral-400">Choose alternate based on your equipment</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-4 p-2 text-left">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Navigation size={20} />
                </div>
                <div>
                  <div className="font-bold text-white">Move Exercise in Circuit</div>
                  <div className="text-sm text-neutral-400">Adjust the position of an exercise</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-4 p-2 text-left">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <Trash2 size={20} />
                </div>
                <div>
                  <div className="font-bold text-red-500">Remove Exercise</div>
                  <div className="text-sm text-neutral-400">Remove an exercise from the circuit</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
