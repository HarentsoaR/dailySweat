
"use client";

import type { WorkoutPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
// Removed Card imports as it's now modal content
import { ChevronLeft, ChevronRight, FlagOff, TimerIcon as TimerLucideIcon, Zap, Info } from 'lucide-react';

interface ActiveWorkoutDisplayProps {
  workoutPlan: WorkoutPlan;
  currentExerciseIndex: number;
  onNextExercise: () => void;
  onPreviousExercise: () => void;
  onEndWorkout: () => void;
  onStartRest: (duration: number) => void;
  dict: { 
    title?: string; // Title might be handled by DialogTitle now
    exerciseProgress?: string; 
    startRestButton?: string; 
    previousButton?: string;
    nextButton?: string;
    finishButton?: string;
    endWorkoutEarlyButton?: string;
    noCurrentExercise?: string;
  };
}

export function ActiveWorkoutDisplay({
  workoutPlan,
  currentExerciseIndex,
  onNextExercise,
  onPreviousExercise,
  onEndWorkout,
  onStartRest,
  dict,
}: ActiveWorkoutDisplayProps) {
  const currentExercise = workoutPlan.exercises[currentExerciseIndex];

  if (!currentExercise) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">{dict?.noCurrentExercise || "No current exercise. This shouldn't happen!"}</p>
        <Button onClick={onEndWorkout} variant="destructive" className="mt-4">
          {dict?.endWorkoutEarlyButton || "End Workout Early"}
        </Button>
      </div>
    );
  }

  const exerciseProgressText = (dict?.exerciseProgress || "Exercise {current} of {total}: {exerciseName}")
    .replace('{current}', (currentExerciseIndex + 1).toString())
    .replace('{total}', workoutPlan.exercises.length.toString())
    .replace('{exerciseName}', currentExercise.name);

  const startRestButtonText = (dict?.startRestButton || "Start {duration}s Rest").replace('{duration}', currentExercise.rest.toString());

  return (
    // This component is now the content of a Dialog, so no Card wrapper here.
    <div className="space-y-4 pt-2 pb-4"> 
      <p className="text-sm text-muted-foreground text-center mb-2">{exerciseProgressText}</p>
      
      <div className="p-4 border rounded-lg bg-card shadow"> {/* Exercise details card look */}
          <h3 className="text-xl font-semibold mb-2 text-center">{currentExercise.name}</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
            <div>
                <p className="text-muted-foreground">Sets</p> 
                <p className="font-medium">{currentExercise.sets}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Reps</p> 
                <p className="font-medium">{currentExercise.reps}</p>
            </div>
            <div>
                <p className="text-muted-foreground">Rest</p> 
                <p className="font-medium">{currentExercise.rest}s</p>
            </div>
          </div>
          {currentExercise.description && (
              <p className="text-xs italic text-muted-foreground flex items-start">
                  <Info className="mr-1.5 h-3 w-3 mt-0.5 shrink-0"/> 
                  {currentExercise.description}
              </p>
          )}
      </div>

      <Button
        onClick={() => onStartRest(currentExercise.rest)}
        variant="outline"
        className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
      >
        <TimerLucideIcon className="mr-2 h-4 w-4" />
        {startRestButtonText}
      </Button>

      <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
        <Button onClick={onPreviousExercise} disabled={currentExerciseIndex === 0} variant="outline" className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> {dict?.previousButton || "Previous"}
        </Button>
        <Button 
            onClick={onNextExercise} 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          {currentExerciseIndex === workoutPlan.exercises.length - 1 ? (dict?.finishButton || "Finish Workout") : (dict?.nextButton || "Next Exercise")} 
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="pt-2">
        <Button onClick={onEndWorkout} variant="ghost" size="sm" className="w-full text-destructive hover:bg-destructive/10">
            <FlagOff className="mr-2 h-4 w-4" /> {dict?.endWorkoutEarlyButton || "End Workout Early"}
        </Button>
      </div>
    </div>
  );
}

    