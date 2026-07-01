import { useState } from 'react';
import { X, Scale, Calendar, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface WeightLoggerModalProps {
  onClose: () => void;
  onSave?: (newWeight: number) => void;
  currentWeight?: number;
}

export default function WeightLoggerModal({ onClose, onSave, currentWeight = 84 }: WeightLoggerModalProps) {
  const [weight, setWeight] = useState<string>(currentWeight.toString());
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || isNaN(Number(weight))) {
      setError('Please enter a valid weight.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      const { error: insertError } = await supabase
        .from('health_metrics')
        .insert({
          user_id: user?.id,
          type: 'weight',
          value: Number(weight),
          unit: 'kg', // Configurable in a real app
          start_date: new Date(date).toISOString(),
          end_date: new Date(date).toISOString(),
        });

      if (insertError) throw insertError;
      
      if (onSave) onSave(Number(weight));
      onClose();
    } catch (err: any) {
      console.error(err);
      // Fallback to local storage if table is missing or offline
      localStorage.setItem('user_weight', weight);
      if (onSave) onSave(Number(weight));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1A1A24] border border-neutral-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center p-5 border-b border-neutral-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Scale size={16} />
            </div>
            <h2 className="font-bold text-white text-lg">Log Weight</h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors bg-neutral-800/50 p-2 rounded-full">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 relative">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Weight</label>
            <div className="relative flex items-center justify-center bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 focus-within:border-indigo-500 transition-colors">
              <input 
                type="number" 
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-transparent text-5xl font-bold text-white text-center w-32 focus:outline-none"
                placeholder="0.0"
                autoFocus
              />
              <span className="text-xl font-bold text-neutral-500 absolute right-6">kg</span>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Date</label>
            <div className="relative flex items-center bg-neutral-900/50 border border-neutral-800 rounded-xl p-1 focus-within:border-indigo-500 transition-colors">
               <div className="pl-4 text-neutral-500">
                 <Calendar size={18} />
               </div>
               <input 
                 type="date"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className="w-full bg-transparent p-3 text-white focus:outline-none [color-scheme:dark]"
               />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_14px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
            {isSubmitting ? 'Saving...' : 'Save Log'}
          </button>
        </form>
      </div>
    </div>
  );
}
