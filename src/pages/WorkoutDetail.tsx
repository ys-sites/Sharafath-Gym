import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, MoreHorizontal, ArrowDown, Play, Heart, RefreshCw, X, Edit2, ArrowLeftRight, Navigation, Trash2, Star, Dumbbell, Clock, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { getPastSetsForExercise } from '../utils/prs';
import { YouTubeReference } from '../components/ui/YouTubeReference';

const ROUTINE_DETAILS: Record<string, {
  title: string;
  category: string;
  duration: string;
  difficulty: string;
  calories: string;
  image: string;
  description: string;
  rating: string;
  reviews: string;
  circuits: Array<{
    id: number;
    name: string;
    rounds: number;
    exercises: Array<{ id: string; name: string; target_sets: number; target_reps: string; img: string }>
  }>
}> = {
  push_1: {
    title: "Day 1: PUSH (Chest/Shoulders)",
    category: "Strength",
    duration: "45 Min",
    difficulty: "Beginner",
    calories: "320 kcal",
    rating: "4.9",
    reviews: "180 reviews",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    description: "Focus on chest expansion, upper back thickness, and shoulder stability. Start light for your first set.",
    circuits: [
      {
        id: 1,
        name: "CHEST CIRCUIT",
        rounds: 3,
        exercises: [
          { id: "p1", name: "Machine Chest Press", target_sets: 3, target_reps: "6-10", img: "https://img.youtube.com/vi/pLofEAcfsO8/hqdefault.jpg" },
          { id: "p2", name: "Incline Dumbbell Press", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/IP4oeKh1Sd4/hqdefault.jpg" },
          { id: "p3", name: "Machine Pec Deck Fly", target_sets: 2, target_reps: "10-15", img: "https://img.youtube.com/vi/JYmszQs-mRs/hqdefault.jpg" }
        ]
      },
      {
        id: 2,
        name: "SHOULDERS & TRICEPS",
        rounds: 3,
        exercises: [
          { id: "p4", name: "Dumbbell Lateral Raise", target_sets: 3, target_reps: "12-15", img: "https://img.youtube.com/vi/PzsMitRdI_8/hqdefault.jpg" },
          { id: "p5", name: "Reverse Pec Deck", target_sets: 3, target_reps: "12-15", img: "https://img.youtube.com/vi/P6-N-VGCVxk/hqdefault.jpg" },
          { id: "p6", name: "Tricep Pushdown (rope)", target_sets: 3, target_reps: "10-15", img: "https://img.youtube.com/vi/-zLyUAo1gMw/hqdefault.jpg" },
          { id: "p7", name: "Overhead Rope Extension", target_sets: 3, target_reps: "10-15", img: "https://img.youtube.com/vi/1657VVZi0Ms/hqdefault.jpg" }
        ]
      }
    ]
  },
  pull_1: {
    title: "Day 2: PULL (Back/Biceps)",
    category: "Strength",
    duration: "40 Min",
    difficulty: "Beginner",
    calories: "300 kcal",
    rating: "4.8",
    reviews: "150 reviews",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800",
    description: "Focus on pulling mechanics, width, and thickness. Ensure slow and controlled arm curls.",
    circuits: [
      {
        id: 1,
        name: "BACK WIDTH & THICKNESS",
        rounds: 3,
        exercises: [
          { id: "pl1", name: "Wide-Grip Lat Pulldown", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/8hzVLzu-RJk/hqdefault.jpg" },
          { id: "pl2", name: "Close-Grip Lat Pulldown", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/8hzVLzu-RJk/hqdefault.jpg" },
          { id: "pl3", name: "Seated Cable Row", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/vwHG9Jfu4sw/hqdefault.jpg" },
          { id: "pl4", name: "Wide-Grip Row", target_sets: 3, target_reps: "8", img: "https://img.youtube.com/vi/1nRP8S_O6l0/hqdefault.jpg" }
        ]
      },
      {
        id: 2,
        name: "ISOLATION & ARMS",
        rounds: 3,
        exercises: [
          { id: "pl5", name: "Lat Pullover Machine", target_sets: 3, target_reps: "10-15", img: "https://img.youtube.com/vi/32auHIqgEoM/hqdefault.jpg" },
          { id: "pl6", name: "Preacher Curl", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/Gydpcouclx8/hqdefault.jpg" },
          { id: "pl7", name: "Incline Dumbbell Curl", target_sets: 3, target_reps: "10-12", img: "https://img.youtube.com/vi/HhHHBj3qTJ4/hqdefault.jpg" },
          { id: "pl8", name: "Hammer Curl", target_sets: 3, target_reps: "10-12", img: "https://img.youtube.com/vi/BRVDS6HVR9Q/hqdefault.jpg" }
        ]
      }
    ]
  },
  legs_1: {
    title: "Day 3: LEGS (Quads/Hamstrings)",
    category: "Strength",
    duration: "50 Min",
    difficulty: "Beginner",
    calories: "420 kcal",
    rating: "4.9",
    reviews: "210 reviews",
    image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=800",
    description: "Lower body developer with a focus on deep control. Protect your lower back during Romanian Deadlifts.",
    circuits: [
      {
        id: 1,
        name: "QUADS & GLUTES",
        rounds: 3,
        exercises: [
          { id: "l1", name: "Hack Squat", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/0tn5K9NlCfo/hqdefault.jpg" },
          { id: "l2", name: "Leg Press", target_sets: 3, target_reps: "10-15", img: "https://img.youtube.com/vi/ETOAyWM6i6A/hqdefault.jpg" },
          { id: "l3", name: "Leg Extension", target_sets: 2, target_reps: "12-15", img: "https://img.youtube.com/vi/swZQC689o9U/hqdefault.jpg" }
        ]
      },
      {
        id: 2,
        name: "HAMSTRINGS & CALVES",
        rounds: 3,
        exercises: [
          { id: "l4", name: "Dumbbell Romanian Deadlift", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/hQgFixeXdZo/hqdefault.jpg" },
          { id: "l5", name: "Seated Leg Curl", target_sets: 3, target_reps: "10-15", img: "https://img.youtube.com/vi/IOufFLwNOTU/hqdefault.jpg" },
          { id: "l6", name: "Standing Calf Raise", target_sets: 3, target_reps: "12-20", img: "https://img.youtube.com/vi/SRUtMJ0tE2A/hqdefault.jpg" },
          { id: "l7", name: "Seated Leg Raises (core)", target_sets: 3, target_reps: "10-15", img: "https://img.youtube.com/vi/l4kQd9eWclE/hqdefault.jpg" }
        ]
      }
    ]
  },
  upper_1: {
    title: "Day 5: UPPER (Hypertrophy)",
    category: "Strength",
    duration: "50 Min",
    difficulty: "Beginner",
    calories: "380 kcal",
    rating: "4.9",
    reviews: "195 reviews",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800",
    description: "High-volume hypertrophy upper body day. Keep rest times moderate.",
    circuits: [
      {
        id: 1,
        name: "CHEST & BACK",
        rounds: 3,
        exercises: [
          { id: "u1", name: "Incline Machine Press", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/VesHgJR14E8/hqdefault.jpg" },
          { id: "u2", name: "Machine Chest Press", target_sets: 2, target_reps: "8-12", img: "https://img.youtube.com/vi/pLofEAcfsO8/hqdefault.jpg" },
          { id: "u3", name: "Pull-Ups / Assisted Pull-Ups", target_sets: 3, target_reps: "6-10", img: "https://img.youtube.com/vi/gx0RWT7WbmA/hqdefault.jpg" },
          { id: "u4", name: "Chest-Supported Row", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/vmX58YYK3-8/hqdefault.jpg" }
        ]
      },
      {
        id: 2,
        name: "SHOULDERS & ARMS",
        rounds: 3,
        exercises: [
          { id: "u5", name: "Dumbbell Lateral Raise", target_sets: 3, target_reps: "12-15", img: "https://img.youtube.com/vi/PzsMitRdI_8/hqdefault.jpg" },
          { id: "u6", name: "Reverse Pec Deck", target_sets: 3, target_reps: "12-15", img: "https://img.youtube.com/vi/P6-N-VGCVxk/hqdefault.jpg" },
          { id: "u7", name: "Preacher Curl", target_sets: 3, target_reps: "10-12", img: "https://img.youtube.com/vi/Gydpcouclx8/hqdefault.jpg" },
          { id: "u8", name: "Cable Curl", target_sets: 2, target_reps: "10-12", img: "https://img.youtube.com/vi/NFzTWp2qpiE/hqdefault.jpg" },
          { id: "u9", name: "Rope Pushdown", target_sets: 3, target_reps: "10-12", img: "https://img.youtube.com/vi/qHDrQglWgS4/hqdefault.jpg" },
          { id: "u10", name: "Overhead Cable Extension", target_sets: 2, target_reps: "10-12", img: "https://img.youtube.com/vi/1657VVZi0Ms/hqdefault.jpg" }
        ]
      }
    ]
  },
  lower_1: {
    title: "Day 6: LOWER (Quads/Hamstrings/Core)",
    category: "Strength",
    duration: "50 Min",
    difficulty: "Beginner",
    calories: "400 kcal",
    rating: "4.9",
    reviews: "165 reviews",
    image: "https://img.youtube.com/vi/HPXa3HdJQnc/hqdefault.jpg",
    description: "Lower body developer focusing on deep control and core stabilization. Focus on form during squatting.",
    circuits: [
      {
        id: 1,
        name: "QUADS & GLUTES",
        rounds: 3,
        exercises: [
          { id: "lw1", name: "Smith Machine Squat", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/HPXa3HdJQnc/hqdefault.jpg" },
          { id: "lw2", name: "Walking Lunges", target_sets: 3, target_reps: "10-12", img: "https://img.youtube.com/vi/Pbmj6xPo-Hw/hqdefault.jpg" },
          { id: "lw3", name: "Leg Extension", target_sets: 2, target_reps: "12-15", img: "https://img.youtube.com/vi/2lvdnQg04PM/hqdefault.jpg" }
        ]
      },
      {
        id: 2,
        name: "HAMSTRINGS & CORE",
        rounds: 3,
        exercises: [
          { id: "lw4", name: "Romanian Deadlift (barbell)", target_sets: 3, target_reps: "8-12", img: "https://img.youtube.com/vi/3VXmecChYYM/hqdefault.jpg" },
          { id: "lw5", name: "Lying Leg Curl", target_sets: 3, target_reps: "10-12", img: "https://img.youtube.com/vi/SbSNUXPRkc8/hqdefault.jpg" },
          { id: "lw6", name: "Hip Thrust", target_sets: 3, target_reps: "10-12", img: "https://img.youtube.com/vi/5S8SApGU_Lk/hqdefault.jpg" },
          { id: "lw7", name: "Standing Calf Raise", target_sets: 3, target_reps: "12-15", img: "https://img.youtube.com/vi/SRUtMJ0tE2A/hqdefault.jpg" },
          { id: "lw8", name: "Seated Calf Raise", target_sets: 3, target_reps: "12-15", img: "https://img.youtube.com/vi/3ZRe_QpvRPg/hqdefault.jpg" },
          { id: "lw9", name: "Cable Crunch", target_sets: 3, target_reps: "12-15", img: "https://img.youtube.com/vi/b9FJ4hIK3pI/hqdefault.jpg" },
          { id: "lw10", name: "Plank", target_sets: 3, target_reps: "1 Min", img: "https://img.youtube.com/vi/pvI5y1aq_JH/hqdefault.jpg" }
        ]
      }
    ]
  }
};const getExerciseVideoUrl = (name: string, imgUrl?: string) => {
  if (imgUrl && imgUrl.includes('youtube.com/vi/')) {
    const parts = imgUrl.split('youtube.com/vi/');
    if (parts[1]) {
      const id = parts[1].split('/')[0];
      if (id) return `https://www.youtube.com/watch?v=${id}`;
    }
  }

  const cleanName = name.toLowerCase().trim();
  const map: Record<string, string> = {
    'machine chest press': 'pLofEAcfsO8',
    'incline dumbbell press': 'IP4oeKh1Sd4',
    'machine pec deck fly': 'JYmszQs-mRs',
    'supported dips': '6lJ_s55V4rM',
    'supported dips (optional)': '6lJ_s55V4rM',
    'dumbbell lateral raise': 'PzsMitRdI_8',
    'reverse pec deck': 'P6-N-VGCVxk',
    'tricep pushdown': '-zLyUAo1gMw',
    'tricep pushdown (rope)': '-zLyUAo1gMw',
    'overhead rope extension': '1657VVZi0Ms',
    'wide-grip lat pulldown': '8hzVLzu-RJk',
    'close-grip lat pulldown': '8hzVLzu-RJk',
    'seated cable row': 'vwHG9Jfu4sw',
    'wide-grip row': '1nRP8S_O6l0',
    'lat pullover machine': '32auHIqgEoM',
    'preacher curl': 'Gydpcouclx8',
    'incline dumbbell curl': 'HhHHBj3qTJ4',
    'hammer curl': 'BRVDS6HVR9Q',
    'hack squat': '0tn5K9NlCfo',
    'leg press': 'ETOAyWM6i6A',
    'leg extension': 'swZQC689o9U',
    'dumbbell romanian deadlift': 'hQgFixeXdZo',
    'seated leg curl': 'IOufFLwNOTU',
    'standing calf raise': 'SRUtMJ0tE2A',
    'seated leg raise': 'l4kQd9eWclE',
    'seated leg raises (core)': 'l4kQd9eWclE',
    'incline machine press': 'VesHgJR14E8',
    'pull-up': 'gx0RWT7WbmA',
    'pull-ups / assisted pull-ups': 'gx0RWT7WbmA',
    'assisted pull-up': 'gx0RWT7WbmA',
    'chest-supported row': 'vmX58YYK3-8',
    'cable curl': 'NFzTWp2qpiE',
    'rope pushdown': 'qHDrQglWgS4',
    'overhead cable extension': '1657VVZi0Ms',
    'smith machine squat': 'HPXa3HdJQnc',
    'walking lunges': 'Pbmj6xPo-Hw',
    'romanian deadlift (barbell)': '3VXmecChYYM',
    'lying leg curl': 'SbSNUXPRkc8',
    'hip thrust': '5S8SApGU_Lk',
    'seated calf raise': '3ZRe_QpvRPg',
    'cable crunch': 'b9FJ4hIK3pI',
    'plank': 'pvI5y1aq_JH',
  };

  const id = map[cleanName];
  return id ? `https://www.youtube.com/watch?v=${id}` : 'https://www.youtube.com/watch?v=rxD321l2svE';
};

const getExerciseThumbnail = (name: string, imgUrl?: string) => {
  if (imgUrl && imgUrl.includes('youtube.com/vi/')) {
    const parts = imgUrl.split('youtube.com/vi/');
    if (parts[1]) {
      const id = parts[1].split('/')[0];
      if (id && id.length === 11) {
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
    }
  }

  const cleanName = name.toLowerCase().trim();
  const map: Record<string, string> = {
    'machine chest press': 'pLofEAcfsO8',
    'incline dumbbell press': 'IP4oeKh1Sd4',
    'machine pec deck fly': 'JYmszQs-mRs',
    'supported dips': '6lJ_s55V4rM',
    'supported dips (optional)': '6lJ_s55V4rM',
    'dumbbell lateral raise': 'PzsMitRdI_8',
    'reverse pec deck': 'P6-N-VGCVxk',
    'tricep pushdown': '-zLyUAo1gMw',
    'tricep pushdown (rope)': '-zLyUAo1gMw',
    'overhead rope extension': '1657VVZi0Ms',
    'wide-grip lat pulldown': '8hzVLzu-RJk',
    'close-grip lat pulldown': '8hzVLzu-RJk',
    'seated cable row': 'vwHG9Jfu4sw',
    'wide-grip row': '1nRP8S_O6l0',
    'lat pullover machine': '32auHIqgEoM',
    'preacher curl': 'Gydpcouclx8',
    'incline dumbbell curl': 'HhHHBj3qTJ4',
    'hammer curl': 'BRVDS6HVR9Q',
    'hack squat': '0tn5K9NlCfo',
    'leg press': 'ETOAyWM6i6A',
    'leg extension': 'swZQC689o9U',
    'dumbbell romanian deadlift': 'hQgFixeXdZo',
    'seated leg curl': 'IOufFLwNOTU',
    'standing calf raise': 'SRUtMJ0tE2A',
    'seated leg raise': 'l4kQd9eWclE',
    'seated leg raises (core)': 'l4kQd9eWclE',
    'incline machine press': 'VesHgJR14E8',
    'pull-up': 'gx0RWT7WbmA',
    'pull-ups / assisted pull-ups': 'gx0RWT7WbmA',
    'assisted pull-up': 'gx0RWT7WbmA',
    'chest-supported row': 'vmX58YYK3-8',
    'cable curl': 'NFzTWp2qpiE',
    'rope pushdown': 'qHDrQglWgS4',
    'overhead cable extension': '1657VVZi0Ms',
    'smith machine squat': 'HPXa3HdJQnc',
    'walking lunges': 'Pbmj6xPo-Hw',
    'romanian deadlift (barbell)': '3VXmecChYYM',
    'lying leg curl': 'SbSNUXPRkc8',
    'hip thrust': '5S8SApGU_Lk',
    'seated calf raise': '3ZRe_QpvRPg',
    'cable crunch': 'b9FJ4hIK3pI',
    'plank': 'pvI5y1aq_JH',
  };

  const id = map[cleanName] || 'rxD321l2svE';
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};
export default function WorkoutDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const activeDetails = (id && ROUTINE_DETAILS[id]) || ROUTINE_DETAILS.push_1;
  const [programDetails, setProgramDetails] = useState<any>(activeDetails);
  const [circuits, setCircuits] = useState<any[]>(activeDetails.circuits);
  const [loading, setLoading] = useState(true);

  // Fetch user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await supabase.auth.getUser();
      return res.data.user;
    },
    staleTime: Infinity,
  });

  const selectedExercise = circuits.flatMap(c => c.exercises || []).find(ex => ex.id === activeMenu);

  // Fetch personal record stats & weight trend for selected exercise
  const { data: exerciseHistory = [] } = useQuery({
    queryKey: ['exerciseHistory', user?.id, selectedExercise?.name],
    queryFn: async () => {
      if (!user || !selectedExercise?.name) return [];
      
      const { data: exData } = await supabase
        .from('exercises')
        .select('id')
        .eq('name', selectedExercise.name)
        .limit(1)
        .maybeSingle();

      if (!exData) return [];

      const sets = await getPastSetsForExercise(user.id, exData.id);
      
      const bestSetPerDay = new Map<string, number>();
      sets.forEach((s: any) => {
        const dateStr = new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const existing = bestSetPerDay.get(dateStr) || 0;
        if (s.weight > existing) {
          bestSetPerDay.set(dateStr, s.weight);
        }
      });

      return Array.from(bestSetPerDay.entries()).map(([date, weight]) => ({
        date,
        weight
      }));
    },
    enabled: !!user?.id && !!selectedExercise?.name
  });

  const fetchTemplateData = async () => {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user;
      if (!user) {
        setCircuits(activeDetails.circuits);
        setLoading(false);
        return;
      }

      const isCustomTemplate = id && !ROUTINE_DETAILS[id];
      let templateData = null;

      if (isCustomTemplate) {
        const { data, error: tempError } = await supabase
          .from('workout_templates')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (tempError) throw tempError;
        templateData = data;
      } else {
        let splitDay = 'Day 1';
        if (id === 'pull_1') splitDay = 'Day 2';
        if (id === 'legs_1') splitDay = 'Day 3';
        if (id === 'upper_1') splitDay = 'Day 5';

        const { data } = await supabase
          .from('workout_templates')
          .select('*')
          .eq('user_id', user.id)
          .eq('split_day', splitDay)
          .maybeSingle();
        templateData = data;
      }

      if (!templateData) {
        if (isCustomTemplate) {
          throw new Error('Template not found');
        }
        // Seed standard template matching user_id
        let splitDay = 'Day 1';
        if (id === 'pull_1') splitDay = 'Day 2';
        if (id === 'legs_1') splitDay = 'Day 3';
        if (id === 'upper_1') splitDay = 'Day 5';

        const { data: newTemplate, error: insertError } = await supabase
          .from('workout_templates')
          .insert({
            user_id: user.id,
            name: activeDetails.title,
            split_day: splitDay
          })
          .select()
          .single();

        if (insertError) throw insertError;
        templateData = newTemplate;

        // Insert exercises
        let orderIndex = 0;
        for (const circuit of activeDetails.circuits) {
          for (const ex of circuit.exercises) {
            let { data: existingEx } = await supabase
              .from('exercises')
              .select('*')
              .eq('name', ex.name)
              .maybeSingle();

            let exerciseId = existingEx?.id;

            if (!existingEx) {
              const { data: newEx } = await supabase
                .from('exercises')
                .insert({
                  name: ex.name,
                  user_id: user.id,
                  youtube_url: getExerciseVideoUrl(ex.name, ex.img)
                })
                .select()
                .single();
              exerciseId = newEx?.id;
            }

            await supabase
              .from('template_exercises')
              .insert({
                template_id: templateData.id,
                exercise_id: exerciseId,
                order_index: orderIndex++,
                target_sets: ex.target_sets,
                target_reps: ex.target_reps,
                is_circuit: true
              });
          }
        }
      }

      // Fetch template exercises
      let { data: tempExercises, error: exError } = await supabase
        .from('template_exercises')
        .select(`
          id, order_index, target_sets, target_reps, is_circuit,
          exercises ( id, name, youtube_url, image_urls )
        `)
        .eq('template_id', templateData.id)
        .order('order_index', { ascending: true });

      if (exError) throw exError;

      // Self-healing database correction block
      if (tempExercises && !isCustomTemplate) {
        // Build a flat list of local exercises for this routine
        const localExercises = activeDetails.circuits.flatMap(c => 
          c.exercises.map(ex => ({ ...ex }))
        );

        for (const te of tempExercises) {
          const exName = (te.exercises as any)?.name;
          const localEx = localExercises.find(le => le.name.toLowerCase().trim() === exName?.toLowerCase().trim());
          if (localEx) {
            const expectedSets = localEx.target_sets;
            const expectedReps = localEx.target_reps;
            const expectedUrl = getExerciseVideoUrl(localEx.name);

            // 1. Correct template_exercises sets/reps if wrong
            if (te.target_sets !== expectedSets || te.target_reps !== expectedReps) {
              await supabase
                .from('template_exercises')
                .update({
                  target_sets: expectedSets,
                  target_reps: expectedReps
                })
                .eq('id', te.id);
              
              te.target_sets = expectedSets;
              te.target_reps = expectedReps;
            }

            // 2. Correct exercises table youtube_url if wrong or missing
            const dbUrl = (te.exercises as any)?.youtube_url;
            if (dbUrl !== expectedUrl) {
              await supabase
                .from('exercises')
                .update({ youtube_url: expectedUrl })
                .eq('id', (te.exercises as any)?.id);
              
              (te.exercises as any).youtube_url = expectedUrl;
            }
          }
        }
      }

      if (isCustomTemplate) {
        const loadedCircuits = [{
          id: 1,
          name: "GENERATED EXERCISES",
          rounds: 1,
          exercises: (tempExercises || []).map(te => {
            const dbVideoUrl = (te.exercises as any)?.youtube_url || '';
            const dbImageUrls = (te.exercises as any)?.image_urls || [];
            const videoUrl = dbVideoUrl && dbVideoUrl !== 'https://www.youtube.com/watch?v=rxD321l2svE' 
              ? dbVideoUrl 
              : getExerciseVideoUrl((te.exercises as any)?.name || '');
            const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            const videoId = match ? match[1] : 'rxD321l2svE';
            return {
              id: te.id,
              name: (te.exercises as any)?.name || 'Exercise',
              details: `${te.target_sets} Sets x ${te.target_reps} Reps`,
              img: dbImageUrls[0] || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              target_sets: te.target_sets,
              target_reps: te.target_reps
            };
          })
        }];
        setCircuits(loadedCircuits);
        setProgramDetails({
          title: templateData.name,
          category: "Generator",
          duration: "45 Min",
          difficulty: "Hypertrophy",
          calories: "350 kcal",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
          description: "Custom program generated by TrainTrack Workout Generator."
        });
      } else {
        let exercisePointer = 0;
        const loadedCircuits = activeDetails.circuits.map((circ, cIdx) => {
          const limit = circ.exercises.length;
          const slice = tempExercises?.slice(exercisePointer, exercisePointer + limit) || [];
          exercisePointer += limit;

          return {
            id: circ.id,
            name: circ.name,
            rounds: slice[0]?.target_sets || circ.rounds,
            exercises: slice.map(te => {
              const dbVideoUrl = (te.exercises as any)?.youtube_url || '';
              const videoUrl = dbVideoUrl && dbVideoUrl !== 'https://www.youtube.com/watch?v=rxD321l2svE' 
                ? dbVideoUrl 
                : getExerciseVideoUrl((te.exercises as any)?.name || '');
              const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
              const videoId = match ? match[1] : 'rxD321l2svE';
              return {
                id: te.id,
                name: (te.exercises as any)?.name || 'Exercise',
                details: `${te.target_sets} Sets x ${te.target_reps} Reps`,
                img: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                target_sets: te.target_sets,
                target_reps: te.target_reps
              };
            })
          };
        });

        setCircuits(loadedCircuits);
        setProgramDetails({
          ...activeDetails,
          title: templateData.name
        });
      }
    } catch (err) {
      console.error(err);
      setCircuits(activeDetails.circuits);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplateData();
  }, [id]);

  const handleEditRepsSets = async (templateExerciseId: string) => {
    const newSets = prompt("Enter new target Sets:", "3");
    const newReps = prompt("Enter new target Reps range (e.g. 8-12):", "10");
    if (!newSets || !newReps) return;

    try {
      const { error } = await supabase
        .from('template_exercises')
        .update({
          target_sets: Number(newSets),
          target_reps: newReps
        })
        .eq('id', templateExerciseId);

      if (error) throw error;
      fetchTemplateData();
      setActiveMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwapExercise = async (templateExerciseId: string) => {
    const newName = prompt("Enter new exercise name:");
    if (!newName) return;

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      let { data: existingEx } = await supabase
        .from('exercises')
        .select('*')
        .eq('name', newName)
        .maybeSingle();

      let exerciseId = existingEx?.id;

      if (!existingEx) {
        const { data: newEx } = await supabase
          .from('exercises')
          .insert({
            name: newName,
            user_id: user.id,
            youtube_url: 'https://www.youtube.com/watch?v=rxD321l2svE'
          })
          .select()
          .single();
        exerciseId = newEx?.id;
      }

      const { error } = await supabase
        .from('template_exercises')
        .update({ exercise_id: exerciseId })
        .eq('id', templateExerciseId);

      if (error) throw error;
      fetchTemplateData();
      setActiveMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorder = async (templateExerciseId: string) => {
    const newOrder = prompt("Enter new position index (e.g. 0, 1, 2):", "0");
    if (newOrder === null) return;

    try {
      const { error } = await supabase
        .from('template_exercises')
        .update({ order_index: Number(newOrder) })
        .eq('id', templateExerciseId);

      if (error) throw error;
      fetchTemplateData();
      setActiveMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveExercise = async (templateExerciseId: string) => {
    const confirmRemove = window.confirm("Are you sure you want to remove this exercise from the routine?");
    if (!confirmRemove) return;

    try {
      const { error } = await supabase
        .from('template_exercises')
        .delete()
        .eq('id', templateExerciseId);

      if (error) throw error;
      fetchTemplateData();
      setActiveMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0C0D12] min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-neutral-400">Loading plan details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0C0D12] min-h-screen text-white font-sans flex flex-col pb-36 relative">
      {/* Top Floating Header (Hero Cover) */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img 
          src={programDetails.image} 
          alt={programDetails.title} 
          className="w-full h-full object-cover"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0C0D12]"></div>
        
        {/* Navigation Buttons Overlay */}
        <div className="absolute top-12 left-0 w-full px-6 flex justify-between items-center z-20">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors">
              <Share2 size={16} className="text-white" />
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all ${isSaved ? 'text-indigo-400 bg-indigo-500/20' : 'text-white'}`}
            >
              <Heart size={16} className={isSaved ? 'fill-indigo-400' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Program Details Content */}
      <div className="relative z-10 -mt-10 px-6 space-y-6">
        <div>
          {/* Eyebrow badge / Category */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-3">
            {programDetails.category}
          </div>
          
          {/* Workout Title */}
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            {programDetails.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-300">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span>{programDetails.rating}</span>
            <span className="text-neutral-500 font-medium">({programDetails.reviews})</span>
          </div>
        </div>

        {/* Stats Grid Pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 p-1 rounded-2xl shadow-md">
            <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2-0.25rem)] p-3 flex flex-col items-center justify-center text-center">
              <Clock size={16} className="text-indigo-400 mb-1" />
              <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Duration</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{programDetails.duration}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-1 rounded-2xl shadow-md">
            <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2-0.25rem)] p-3 flex flex-col items-center justify-center text-center">
              <Dumbbell size={16} className="text-teal-400 mb-1" />
              <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Level</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{programDetails.difficulty}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-1 rounded-2xl shadow-md">
            <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2-0.25rem)] p-3 flex flex-col items-center justify-center text-center">
              <Flame size={16} className="text-red-500 mb-1 animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Burn</span>
              <span className="text-sm font-extrabold text-white mt-0.5">{programDetails.calories}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-base tracking-tight">About the workout</h3>
          <p className="text-sm text-neutral-400 leading-relaxed font-medium">
            {programDetails.description}
          </p>
        </div>

        {/* Exercises Circuits List */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-base tracking-tight">Routine Circuit</h3>
          
          {circuits.map((circuit, cIdx) => (
            <div key={circuit.id} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-[11px] font-extrabold text-neutral-500 tracking-widest uppercase">{circuit.name}</h4>
                <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
                  {circuit.rounds} Rounds
                </div>
              </div>
              
              {/* Double-Bezel list container */}
              <div className="bg-white/5 border border-white/10 p-2 rounded-[2.2rem] shadow-xl relative">
                <div className="bg-[#13141C] rounded-[calc(2.2rem-0.5rem)] p-5 border border-neutral-800/30 relative">
                  
                  {/* Vertical connector line */}
                  <div className="absolute left-[34px] top-8 bottom-8 w-[1px] bg-indigo-500/20 z-0"></div>
                  
                  <div className="space-y-6 relative z-10">
                    {circuit.exercises.map((ex, eIdx) => (
                      <div key={ex.id} className="relative">
                        <div className="flex items-center gap-4">
                          {/* Image box with small border & play click trigger */}
                          <div 
                            onClick={() => setActiveVideoUrl(getExerciseVideoUrl(ex.name, ex.img))}
                            className="w-16 h-16 rounded-2xl bg-neutral-800 overflow-hidden shrink-0 border border-neutral-700/40 z-10 shadow-md relative group/thumb cursor-pointer active:scale-95 transition-transform"
                          >
                            <img src={getExerciseThumbnail(ex.name, ex.img)} alt={ex.name} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                              <Play size={16} className="text-white fill-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-white text-base leading-tight tracking-tight">{ex.name}</h3>
                              <button 
                                onClick={() => setActiveVideoUrl(getExerciseVideoUrl(ex.name, ex.img))}
                                className="text-[10px] text-indigo-400 font-extrabold uppercase hover:underline flex items-center gap-0.5 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full"
                              >
                                <Play size={8} className="fill-indigo-400" /> Tutorial
                              </button>
                            </div>
                            <p className="text-xs font-bold text-neutral-400 mt-1">{ex.details || `${ex.target_sets} Sets x ${ex.target_reps} Reps`}</p>
                          </div>
                          
                          <button 
                            onClick={() => setActiveMenu(ex.id)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-white"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </div>
                        
                        {/* Connecting arrows */}
                        {eIdx < circuit.exercises.length - 1 && (
                          <div className="flex justify-center w-16 mt-4 text-indigo-500/40">
                            <ArrowDown size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fixed bottom button (Double bezel floating wrapper) */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#0C0D12] via-[#0C0D12]/95 to-transparent z-40">
        <div className="bg-white/5 border border-white/10 p-1.5 rounded-full shadow-2xl max-w-lg mx-auto">
          <button 
            onClick={() => navigate(`/active-workout/${id}`)}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-4 rounded-full text-lg transition-all active:scale-[0.98] tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Play size={18} className="fill-white" /> Start workout
          </button>
        </div>
      </div>

      {/* Option Menu Overlay */}
      {activeMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveMenu(null)}>
          <div className="bg-[#13141C] w-full rounded-t-3xl p-6 pb-12 border-t border-neutral-800/40 max-w-md animate-in slide-in-from-bottom-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold tracking-tight">Modify exercise</h3>
              <button onClick={() => setActiveMenu(null)} className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleEditRepsSets(activeMenu)}
                className="w-full flex items-center gap-4 p-2.5 text-left bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Edit2 size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm">Edit Reps / Sets</div>
                  <div className="text-xs text-neutral-400 mt-0.5">Easily adjust Target ranges</div>
                </div>
              </button>
              
              <button 
                onClick={() => handleSwapExercise(activeMenu)}
                className="w-full flex items-center gap-4 p-2.5 text-left bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                  <ArrowLeftRight size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm">Swap Exercise</div>
                  <div className="text-xs text-neutral-400 mt-0.5">Choose alternate movements</div>
                </div>
              </button>

              <button 
                onClick={() => handleReorder(activeMenu)}
                className="w-full flex items-center gap-4 p-2.5 text-left bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                  <Navigation size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm">Re-order Circuit</div>
                  <div className="text-xs text-neutral-400 mt-0.5">Shift position in group</div>
                </div>
              </button>

              <button 
                onClick={() => handleRemoveExercise(activeMenu)}
                className="w-full flex items-center gap-4 p-2.5 text-left bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <Trash2 size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-red-500 text-sm">Remove from Routine</div>
                  <div className="text-xs text-neutral-400 mt-0.5">Delete exercise completely</div>
                </div>
              </button>
            </div>

            {/* PR Progression chart */}
            {selectedExercise && (
              <div className="border-t border-neutral-850 pt-4 mt-6">
                <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest block mb-3">Best Weight Progression</span>
                <div className="h-32 w-full bg-black/20 rounded-2xl p-2 border border-neutral-850/50">
                  {exerciseHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-neutral-600 font-extrabold text-center">
                      No tracked set history yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={exerciseHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="date" stroke="#52525b" fontSize={8} tickLine={false} axisLine={false} />
                        <YAxis stroke="#52525b" fontSize={8} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip contentStyle={{ backgroundColor: '#13141C', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }} />
                        <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verified YouTube Form Tutorial Modal Popover */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setActiveVideoUrl(null)}>
          <div className="bg-[#13141C] border border-neutral-800/40 rounded-3xl overflow-hidden max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-neutral-800/40">
              <h3 className="font-extrabold text-base text-white">Exercise Tutorial</h3>
              <button 
                onClick={() => setActiveVideoUrl(null)} 
                className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <YouTubeReference url={activeVideoUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
