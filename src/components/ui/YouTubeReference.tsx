import { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '../../lib/utils';

interface YouTubeReferenceProps {
  url: string;
}

export function YouTubeReference({ url }: YouTubeReferenceProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID
  // e.g. https://www.youtube.com/watch?v=12345678901 or https://youtu.be/12345678901
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = extractVideoId(url);

  if (!videoId) return null;

  // using loop=1, playlist={videoId} (required for loop), mute=1, controls=0
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`;

  if (!isPlaying) {
    return (
      <button 
        onClick={() => setIsPlaying(true)}
        className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm font-medium text-neutral-400 hover:text-white transition-colors"
      >
        <Play size={16} className="text-orange-500" />
        Watch Reference
      </button>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-neutral-800 bg-black aspect-video">
      <iframe
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    </div>
  );
}
