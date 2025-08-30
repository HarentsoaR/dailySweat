"use client";

import type { WorkoutPlan, Exercise } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FlagOff, TimerIcon as TimerLucideIcon, Info, PauseCircle, PlayCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress'; // For visual timer progress

interface ActiveWorkoutDisplayProps {
  workoutPlan: WorkoutPlan;
  currentExercise: Exercise;
  currentExerciseIndex: number;
  onNextExercise: () => void;
  onPreviousExercise: () => void;
  onEndWorkout: () => void;
  onStartRest: (duration: number) => void;
  dict: { 
    exerciseProgress?: string; 
    startRestButton?: string; 
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
  modalDict: { // For general modal button text not specific to this component
    exerciseTimerTitle?: string;
    pauseExerciseButton?: string;
    resumeExerciseButton?: string;
  }
}

export function ActiveWorkoutDisplay({
  workoutPlan,
  currentExercise,
  currentExerciseIndex,
  onNextExercise,
  onPreviousExercise,
  onEndWorkout,
  onStartRest,
  dict,
  exerciseTimeLeft,
  isExerciseTimerRunning, // For overall state, not just pause
  isExerciseTimerPaused,
  isCurrentExerciseTimed,
  canStartRest,
  onToggleExerciseTimerPause,
  modalDict,
}: ActiveWorkoutDisplayProps) {

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

  const startRestButtonText = (dict?.startRestButton || "Start {duration}s Rest").replace('{duration}', currentExercise.rest.toString());

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  const exerciseTimerProgress = currentExercise.duration && exerciseTimeLeft !== null
    ? ((currentExercise.duration - exerciseTimeLeft) / currentExercise.duration) * 100
    : 0;

  return (
    <div className="space-y-4 pt-2 pb-4"> 
      <p className="text-sm text-muted-foreground text-center mb-2">{exerciseProgressText}</p>
      
      <div className="p-4 border rounded-lg bg-card shadow">
          <h3 className="text-xl font-semibold mb-2 text-center">{currentExercise.name}</h3>
          
          {isCurrentExerciseTimed && currentExercise.duration && exerciseTimeLeft !== null && (
            <div className="my-3 text-center space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{modalDict?.exerciseTimerTitle || dict?.durationLabel || "Time"}</p>
              <p className="text-4xl font-bold font-mono text-primary">{formatTime(exerciseTimeLeft)}</p>
              <Progress value={exerciseTimerProgress} className="h-2 [&>div]:bg-primary transition-all duration-1000 ease-linear" />
              <Button 
                onClick={onToggleExerciseTimerPause} 
                variant="ghost" 
                size="sm"
                className="text-sm"
              >
                {isExerciseTimerPaused ? <PlayCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}
                {isExerciseTimerPaused ? (modalDict?.resumeExerciseButton || dict?.resumeExercise || "Resume") : (modalDict?.pauseExerciseButton || dict?.pauseExercise || "Pause")}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm mb-3">
            <div>
                <p className="text-muted-foreground">{dict?.setsLabel || "Sets"}</p> 
                <p className="font-medium">{currentExercise.sets}</p>
            </div>
            <div>
                <p className="text-muted-foreground">{dict?.repsLabel || "Reps"}</p> 
                <p className="font-medium">{currentExercise.reps}</p>
            </div>
            {!isCurrentExerciseTimed && currentExercise.duration && ( // Show duration if not actively timing (e.g. for info)
                 <div>
                    <p className="text-muted-foreground">{dict?.durationLabel || "Duration"}</p>
                    <p className="font-medium">{currentExercise.duration}s</p>
                </div>
            )}
            <div>
                <p className="text-muted-foreground">{dict?.restLabel || "Rest"}</p> 
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

      {canStartRest ? (
        <Button
          onClick={() => onStartRest(currentExercise.rest)}
          variant="outline"
          className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          disabled={!canStartRest} 
        >
          <TimerLucideIcon className="mr-2 h-4 w-4" />
          {startRestButtonText}
        </Button>
      ) : (
         isCurrentExerciseTimed && !canStartRest && (
            <p className="text-sm text-center text-muted-foreground py-2">
                <Clock className="inline mr-1 h-4 w-4" /> 
                {dict?.exerciseCompleteMessage || "Complete the exercise timer to enable rest."}
            </p>
         )
      )}


      <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
        <Button onClick={onPreviousExercise} disabled={currentExerciseIndex === 0} variant="outline" className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> {dict?.previousButton || "Previous"}
        </Button>
        <Button 
            onClick={onNextExercise} 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            disabled={isCurrentExerciseTimed && !canStartRest && !isExerciseTimerPaused} // Allow next if timer done or paused
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