import { Star, StarHalf, StarOff } from 'lucide-react';

export default function RatingStars({ value = 0 }) {
  const clamped = Math.max(0, Math.min(5, value));
  const stars = [0, 1, 2, 3, 4].map((i) => {
    const diff = clamped - i;
    if (diff >= 1) return 'full';
    if (diff >= 0.5) return 'half';
    return 'empty';
  });
  return (
    <div className="inline-flex items-center gap-0.5 text-amber-400">
      {stars.map((s, i) => (
        s === 'full' ? <Star key={i} size={14} fill="currentColor" />
        : s === 'half' ? <StarHalf key={i} size={14} />
        : <StarOff key={i} size={14} />
      ))}
    </div>
  );
}




