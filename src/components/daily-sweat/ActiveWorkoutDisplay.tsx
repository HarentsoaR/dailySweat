"use client";

import type { WorkoutPlan, Exercise } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FlagOff, Info, PauseCircle, PlayCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExerciseAnimation } from '@/components/daily-sweat/ExerciseAnimation';

interface ActiveWorkoutDisplayProps {
  workoutPlan: WorkoutPlan;
  currentExercise: Exercise;
  currentExerciseIndex: number;
  onNextExercise: () => void;
  onPreviousExercise: () => void;
  onEndWorkout: () => void;
  // onStartRest: (duration: number) => void; // Removed as rest starts automatically
  dict: { 
    exerciseProgress?: string; 
    // startRestButton?: string; // Removed
    previousButton?: string;
    nextButton?: string;
    finishButton?: string;
    endWorkoutEarlyButton?: string;
    noCurrentExercise?: string;
    exerciseLabel?: string;
    setsLabel?: string;
    repsLabel?: string;
    restLabel?: string;
    durationLabel?: string;
    pauseExercise?: string;
    resumeExercise?: string;
    exerciseCompleteMessage?: string;
  };
  exerciseTimeLeft: number | null;
  isExerciseTimerRunning: boolean;
  isExerciseTimerPaused: boolean;
  isCurrentExerciseTimed: boolean;
  canStartRest: boolean;
  onToggleExerciseTimerPause: () => void;
}

export function ActiveWorkoutDisplay({
  workoutPlan,
  currentExercise,
  currentExerciseIndex,
  onNextExercise,
  onPreviousExercise,
  onEndWorkout,
  // onStartRest, // Removed
  dict,
  exerciseTimeLeft,
  isExerciseTimerRunning,
  isExerciseTimerPaused,
  isCurrentExerciseTimed,
  canStartRest,
  onToggleExerciseTimerPause,
}: ActiveWorkoutDisplayProps) {

  // Touch swipe navigation support
  let touchStartX = 0;
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX = e.changedTouches[0]?.clientX || 0;
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const endX = e.changedTouches[0]?.clientX || 0;
    const delta = endX - touchStartX;
    if (Math.abs(delta) < 50) return; // ignore tiny swipes
    if (delta < 0) {
      // swipe left -> next
      if (!(isCurrentExerciseTimed && isExerciseTimerRunning && !isExerciseTimerPaused)) {
        onNextExercise();
      }
    } else {
      // swipe right -> prev
      if (currentExerciseIndex > 0) onPreviousExercise();
    }
  };

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

  const exerciseProgressText = (dict?.exerciseProgress || "Exercise {current} of {total}")
    .replace('{current}', (currentExerciseIndex + 1).toString())
    .replace('{total}', workoutPlan.exercises.length.toString());

  // const startRestButtonText = (dict?.startRestButton || "Start {duration}s Rest").replace('{duration}', currentExercise.rest.toString()); // Removed

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  const initialExerciseDuration = currentExercise.duration || 0;
  const displayTime = (isExerciseTimerRunning || isExerciseTimerPaused) && exerciseTimeLeft !== null 
    ? exerciseTimeLeft 
    : initialExerciseDuration;
  
  const exerciseTimerProgress = initialExerciseDuration > 0 
    ? ((initialExerciseDuration - displayTime) / initialExerciseDuration) * 100 
    : 0;

  // Determine if the "Next Exercise" button should be disabled
  const isNextButtonDisabled = isCurrentExerciseTimed && isExerciseTimerRunning && !isExerciseTimerPaused;
  // Determine if the "Start Rest" button should be disabled (no longer needed, but keeping logic for context if rest starts automatically)
  // const isStartRestButtonDisabled = isCurrentExerciseTimed && !canStartRest;


  return (
    <div
      className="space-y-4 pt-2 pb-24 max-w-xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    > 
      <p className="text-sm text-muted-foreground text-center mb-2">{exerciseProgressText}</p>
      
      <ExerciseAnimation exercise={currentExercise} workout={workoutPlan} className="mt-2" />

      <div className="p-5 border rounded-xl bg-card shadow-lg">
          <h3 className="text-2xl font-semibold mb-3 text-center font-headline tracking-tight">{currentExercise.name}</h3>
          
          {currentExercise.duration && currentExercise.duration > 0 && (
            <div className="my-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{dict?.durationLabel || "Time"}</p>
              <p className="text-5xl font-bold font-mono text-primary tabular-nums" aria-live="polite">
                {formatTime(displayTime)}
              </p>
              <Progress value={exerciseTimerProgress} className="h-2 [&>div]:bg-primary transition-all duration-1000 ease-linear" />
              <Button 
                onClick={onToggleExerciseTimerPause} 
                variant="ghost" 
                size="sm"
                className="text-sm"
                disabled={displayTime === 0 && !isExerciseTimerRunning}
              >
                {isExerciseTimerRunning && !isExerciseTimerPaused ? <PauseCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                {isExerciseTimerRunning && !isExerciseTimerPaused ? (dict?.pauseExercise || "Pause") : (dict?.resumeExercise || "Play")}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2 text-sm mb-4">
            <Badge variant="outline" className="px-3 py-1">
              {dict?.setsLabel || "Sets"}
              <span className="ml-2 font-semibold">{currentExercise.sets}</span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {dict?.repsLabel || "Reps"}
              <span className="ml-2 font-semibold">{currentExercise.reps}</span>
            </Badge>
            {currentExercise.duration && currentExercise.duration > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                {dict?.durationLabel || "Duration"}
                <span className="ml-2 font-semibold">{currentExercise.duration}s</span>
              </Badge>
            )}
            <Badge variant="outline" className="px-3 py-1">
              {dict?.restLabel || "Rest"}
              <span className="ml-2 font-semibold">{currentExercise.rest}s</span>
            </Badge>
          </div>

          {currentExercise.description && (
              <p className="text-xs italic text-muted-foreground flex items-start">
                  <Info className="mr-1.5 h-3 w-3 mt-0.5 shrink-0"/> 
                  {currentExercise.description}
              </p>
          )}
      </div>

      {/* Removed Start Rest button as it will be automatic */}
      {/* {currentExercise.rest > 0 && (
        <Button
          onClick={() => onStartRest(currentExercise.rest)}
          variant="outline"
          className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          disabled={isStartRestButtonDisabled}
        >
          <TimerLucideIcon className="mr-2 h-4 w-4" />
          {startRestButtonText}
        </Button>
      )} */}
      
      {isCurrentExerciseTimed && !canStartRest && (
        <p className="text-sm text-center text-muted-foreground py-2">
            <Clock className="inline mr-1 h-4 w-4" /> 
            {dict?.exerciseCompleteMessage || "Complete the exercise timer to enable rest."}
        </p>
      )}

      {/* Sticky action bar */}
      <div className="sticky bottom-0 left-0 right-0 mx-auto max-w-xl pb-4">
        <div className="rounded-xl border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <Button onClick={onPreviousExercise} disabled={currentExerciseIndex === 0} variant="outline" className="w-full sm:w-auto">
              <ChevronLeft className="mr-2 h-4 w-4" /> {dict?.previousButton || "Previous"}
            </Button>
            <Button 
                onClick={onNextExercise} 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                disabled={isNextButtonDisabled}
            >
              {currentExerciseIndex === workoutPlan.exercises.length - 1 ? (dict?.finishButton || "Finish Workout") : (dict?.nextButton || "Next Exercise")} 
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <Button onClick={onEndWorkout} variant="ghost" size="sm" className="w-full text-destructive hover:bg-destructive/10 mt-2">
              <FlagOff className="mr-2 h-4 w-4" /> {dict?.endWorkoutEarlyButton || "End Workout Early"}
          </Button>
        </div>
      </div>
    </div>
  );
}
