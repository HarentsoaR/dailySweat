"use client";

import type { Exercise } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Repeat, Target, TimerIcon, Info, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExerciseCardProps {
  exercise: Exercise;
  // onStartRest: (duration: number) => void; // Removed
  dict: {
    setsLabel?: string;
    repsLabel?: string;
    restLabel?: string;
    durationLabel?: string; // New
    // startRestButton?: string; // Removed
    exerciseInfoTooltip?: string;
  };
}

export function ExerciseCard({ exercise, dict }: ExerciseCardProps) { // onStartRest removed from props
  // const startRestButtonText = (dict?.startRestButton || "Start Rest ({duration}s)").replace('{duration}', String(exercise.rest)); // Removed
  return (
    <Card className="mb-4 shadow-md rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline tracking-tight">
          <Dumbbell className="mr-2 h-5 w-5 text-primary" />
          {exercise.name}
        </CardTitle>
        {exercise.description && (
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-popover text-popover-foreground p-2 rounded shadow-lg">
                <p>{exercise.description}</p>
                <p className="sr-only">{dict?.exerciseInfoTooltip || "Exercise Information"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-primary/5 border-primary/20">
            <Repeat className="h-4 w-4 text-primary" />
            <span className="font-medium">{dict?.setsLabel || "Sets"}</span>
            <span className="font-semibold">{exercise.sets}</span>
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-primary/5 border-primary/20">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium">{dict?.repsLabel || "Reps"}</span>
            <span className="font-semibold">{exercise.reps}</span>
          </span>
          {exercise.duration && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-primary/5 border-primary/20">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">{dict?.durationLabel || "Duration"}</span>
              <span className="font-semibold">{exercise.duration} s</span>
            </span>
          )}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-primary/5 border-primary/20">
            <TimerIcon className="h-4 w-4 text-primary" />
            <span className="font-medium">{dict?.restLabel || "Rest"}</span>
            <span className="font-semibold">{exercise.rest} s</span>
          </span>
        </div>
      </CardContent>
      {/* CardFooter with Start Rest button removed */}
    </Card>
  );
}