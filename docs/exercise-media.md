Exercise How‑To Animations

Overview
- Display looped animations or images for each exercise during an active session.
- Assets live under `public/exercises` and are looked up by slug via a mapping helper.

Where
- Component: `src/components/daily-sweat/ExerciseAnimation.tsx`
- Helper: `src/lib/exercise-media.ts`

Add your assets
1. Export small, loop‑friendly files (recommended):
   - Video: `.mp4` or `.webm` (h264/vp9), 720p, 24–30fps, <= 1–2 MB per clip.
   - Image: `.webp` with light background, >= 800×450.
2. Place them under `public/exercises`, e.g.:
   - `public/exercises/push-up.mp4`
   - `public/exercises/bench-press-barbell.mp4`
   - `public/exercises/plank.webp`

Map names → assets
- Update `MEDIA_MAP` in `src/lib/exercise-media.ts` to point each exercise slug to the right asset.
- Use `slugify(name)` to see how names normalize; you can add equipment‑specific keys like `bench-press-barbell`.

Use in data (optional)
- Exercises can specify `mediaKey` and `mediaAlt` (see `Exercise` type) to override the automatic mapping.

Fallbacks
- If a mapping is missing, a neutral placeholder graphic renders so the UI doesn’t break.

Internationalization
- Alt text can be provided with `exercise.mediaAlt` for localized descriptions. Otherwise a generic label is used.

Performance tips
- Reuse short looped clips; prefer WebP for static sequences.
- Keep total page weight reasonable (< 3–5 MB per session) by limiting concurrent loads.

