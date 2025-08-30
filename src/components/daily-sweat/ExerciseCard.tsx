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
    <Card className="mb-4 shadow-md transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center text-xl font-headline">
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
        <div className="flex items-center text-sm">
          <Repeat className="mr-2 h-4 w-4 text-accent" />
          <span className="font-semibold">{dict?.setsLabel || "Sets:"}</span>
          <span className="ml-1">{exercise.sets}</span>
        </div>
        <div className="flex items-center text-sm">
          <Target className="mr-2 h-4 w-4 text-accent" />
          <span className="font-semibold">{dict?.repsLabel || "Reps:"}</span>
          <span className="ml-1">{exercise.reps}</span>
        </div>
        {exercise.duration && (
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-accent" />
            <span className="font-semibold">{dict?.durationLabel || "Duration:"}</span>
            <span className="ml-1">{exercise.duration} seconds</span>
          </div>
        )}
        <div className="flex items-center text-sm">
          <TimerIcon className="mr-2 h-4 w-4 text-accent" />
          <span className="font-semibold">{dict?.restLabel || "Rest:"}</span>
          <span className="ml-1">{exercise.rest} seconds</span>
        </div>
      </CardContent>
      {/* CardFooter with Start Rest button removed */}
    </Card>
  );
}