"use client";

import Image from 'next/image';
import { getExerciseMedia } from '@/lib/exercise-media';
import type { Exercise, WorkoutPlan } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExerciseAnimationProps {
  exercise: Exercise;
  workout?: Pick<WorkoutPlan, 'equipment'>;
  className?: string;
  dict?: { howToLabel?: string };
}

export function ExerciseAnimation({ exercise, workout, className, dict }: ExerciseAnimationProps) {
  const media = getExerciseMedia(exercise.name, workout?.equipment, exercise.mediaKey);
  const aria = exercise.mediaAlt || dict?.howToLabel || 'How to perform';

  return (
    <div className={cn("rounded-xl border bg-muted/10 overflow-hidden aspect-video w-full max-w-xl mx-auto flex items-center justify-center", className)}>
      {media.kind === 'video' ? (
        <video
          className="h-full w-full object-contain bg-transparent"
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          aria-label={aria}
        />
      ) : (
        <Image
          src={media.src}
          alt={aria}
          width={800}
          height={450}
          className="h-full w-full object-contain"
          priority
        />
      )}
    </div>
  );
}

