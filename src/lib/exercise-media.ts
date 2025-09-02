export type ExerciseMedia = {
  kind: 'image' | 'video';
  src: string; // path under /public
  poster?: string; // optional poster for videos
};

// Normalize common exercise names to stable slugs
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Minimal starter mapping; replace files with real assets in /public/exercises
// For now, many keys fall back to a placeholder.
const MEDIA_MAP: Record<string, ExerciseMedia> = {
  'push-up': { kind: 'image', src: '/exercises/placeholder.svg' },
  'pushups': { kind: 'image', src: '/exercises/placeholder.svg' },
  'squat': { kind: 'image', src: '/exercises/placeholder.svg' },
  'bodyweight-squat': { kind: 'image', src: '/exercises/placeholder.svg' },
  'plank': { kind: 'image', src: '/exercises/placeholder.svg' },
  'bench-press': { kind: 'image', src: '/exercises/placeholder.svg' },
  'barbell-bench-press': { kind: 'image', src: '/exercises/placeholder.svg' },
  'dumbbell-bench-press': { kind: 'image', src: '/exercises/placeholder.svg' },
  'deadlift': { kind: 'image', src: '/exercises/placeholder.svg' },
  'romanian-deadlift': { kind: 'image', src: '/exercises/placeholder.svg' },
  'bicep-curl': { kind: 'image', src: '/exercises/placeholder.svg' },
  'hammer-curl': { kind: 'image', src: '/exercises/placeholder.svg' },
  'lat-pulldown': { kind: 'image', src: '/exercises/placeholder.svg' },
  'row': { kind: 'image', src: '/exercises/placeholder.svg' },
  'seated-row': { kind: 'image', src: '/exercises/placeholder.svg' },
  'lunge': { kind: 'image', src: '/exercises/placeholder.svg' },
  'burpee': { kind: 'image', src: '/exercises/placeholder.svg' },
};

// Attempt equipment-aware lookup by trying specific + generic keys
export function getExerciseMedia(name: string, equipment?: string, explicitKey?: string): ExerciseMedia | null {
  if (explicitKey && MEDIA_MAP[explicitKey]) return MEDIA_MAP[explicitKey];
  const base = slugify(name);
  const eq = equipment ? slugify(equipment) : '';
  const candidates = [
    eq ? `${base}-${eq}` : '', // e.g., bench-press-barbell
    base,
  ].filter(Boolean);
  for (const key of candidates) {
    if (MEDIA_MAP[key]) return MEDIA_MAP[key];
  }
  // Fallback placeholder
  return { kind: 'image', src: '/exercises/placeholder.svg' };
}

