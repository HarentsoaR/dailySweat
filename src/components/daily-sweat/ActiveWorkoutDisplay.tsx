
"use client";

import type { WorkoutPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, FlagOff, TimerIcon as TimerLucideIcon, Zap, Info } from 'lucide-react';

interface ActiveWorkoutDisplayProps {
  workoutPlan: WorkoutPlan;
  currentExerciseIndex: number;
  onNextExercise: () => void;
  onPreviousExercise: () => void;
  onEndWorkout: () => void;
  onStartRest: (duration: number) => void;
  dict: { 
    title?: string;
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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline">
            <Zap className="mr-2 h-6 w-6 text-primary" />
            {dict?.title || "Active Workout"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{dict?.noCurrentExercise || "No current exercise. This shouldn't happen!"}</p>
          <Button onClick={onEndWorkout} variant="destructive" className="mt-4">
            {dict?.endWorkoutEarlyButton || "End Workout Early"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const exerciseProgressText = (dict?.exerciseProgress || "Exercise {current} of {total}: {exerciseName}")
    .replace('{current}', (currentExerciseIndex + 1).toString())
    .replace('{total}', workoutPlan.exercises.length.toString())
    .replace('{exerciseName}', currentExercise.name);

  const startRestButtonText = (dict?.startRestButton || "Start {duration}s Rest").replace('{duration}', currentExercise.rest.toString());


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <Zap className="mr-2 h-6 w-6 text-primary" />
          {workoutPlan.name || dict?.title || "Active Workout"}
        </CardTitle>
        <CardDescription>
          {exerciseProgressText}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg bg-card shadow">
            <h3 className="text-xl font-semibold mb-2">{currentExercise.name}</h3>
            <p className="text-sm text-muted-foreground mb-1">Sets: {currentExercise.sets}</p>
            <p className="text-sm text-muted-foreground mb-1">Reps: {currentExercise.reps}</p>
            <p className="text-sm text-muted-foreground mb-3">Rest: {currentExercise.rest} seconds</p>
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
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
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
      </CardFooter>
      <CardFooter className="pt-2">
        <Button onClick={onEndWorkout} variant="ghost" size="sm" className="w-full text-destructive hover:bg-destructive/10">
            <FlagOff className="mr-2 h-4 w-4" /> {dict?.endWorkoutEarlyButton || "End Workout Early"}
        </Button>
      </CardFooter>
    </Card>
  );
}

