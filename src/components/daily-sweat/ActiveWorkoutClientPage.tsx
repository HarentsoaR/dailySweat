"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ActiveWorkoutDisplay } from "@/components/daily-sweat/ActiveWorkoutDisplay";
import { RestTimer } from "@/components/daily-sweat/RestTimer";
import { FitnessChatbotDialog } from "@/components/daily-sweat/FitnessChatbotDialog";
import { useToast } from "@/hooks/use-toast";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import type { WorkoutPlan, Exercise, DictionaryType } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MessageSquare, PartyPopper, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveWorkoutClientPageProps {
  lang: 'en' | 'fr' | 'es' | 'it' | 'zh';
  workoutId: string;
  dict: DictionaryType;
}

export function ActiveWorkoutClientPage({ lang, workoutId, dict }: ActiveWorkoutClientPageProps) {
  const router = useRouter();
  const { history: workoutHistory, isLoaded: historyLoaded } = useWorkoutHistory();
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Workout Session State
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [workoutCompletionMessage, setWorkoutCompletionMessage] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalSessionDuration, setTotalSessionDuration] = useState<number | null>(null); // in seconds
  const [estimatedKcalBurned, setEstimatedKcalBurned] = useState<number | null>(null);

  // Exercise Timer State
  const [currentExerciseDetails, setCurrentExerciseDetails] = useState<Exercise | null>(null);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState<number | null>(null);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(false);
  const [isExerciseTimerPaused, setIsExerciseTimerPaused] = useState(false);
  const [isCurrentExerciseTimed, setIsCurrentExerciseTimed] = useState(false);
  const [canStartRest, setCanStartRest] = useState(false);
  const exerciseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rest Timer State
  const [restTimerDuration, setRestTimerDuration] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [restTimerKey, setRestTimerKey] = useState(0); // Used to force re-render/reset of RestTimer

  const { toast } = useToast();

  // Helper to calculate session stats
  const calculateSessionStats = useCallback(() => {
    if (sessionStartTime) {
      const endTime = new Date();
      const durationInSeconds = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);
      setTotalSessionDuration(durationInSeconds);
      // Simple estimation: 0.1 kcal per second (approx 6 kcal/minute)
      setEstimatedKcalBurned(Math.round(durationInSeconds * 0.1));
    }
  }, [sessionStartTime]);

  const setupExerciseTimer = useCallback((exercise: Exercise | null) => {
    if (exerciseIntervalRef.current) {
      clearInterval(exerciseIntervalRef.current);
    }
    if (exercise && typeof exercise.duration === 'number' && exercise.duration > 0) {
      setCurrentExerciseDetails(exercise);
      setExerciseTimeLeft(exercise.duration);
      setIsCurrentExerciseTimed(true);
      setIsExerciseTimerRunning(true);
      setIsExerciseTimerPaused(false);
      setCanStartRest(false);
    } else {
      setCurrentExerciseDetails(exercise);
      setExerciseTimeLeft(null);
      setIsCurrentExerciseTimed(false);
      setIsExerciseTimerRunning(false);
      setIsExerciseTimerPaused(false);
      setCanStartRest(true); // Rep-based exercises can start rest immediately
    }
  }, []);

  const handleStartRestTimer = useCallback((duration: number) => {
    setRestTimerDuration(duration);
    setIsRestTimerRunning(true);
    setRestTimerKey(prev => prev + 1); // Reset timer component
  }, []);

  const handleNextExercise = useCallback(() => {
    if (!dict?.page?.toasts || !currentWorkout) return;

    // Stop any active rest timer before moving to the next exercise
    setIsRestTimerRunning(false);
    setRestTimerDuration(0);
    setRestTimerKey(prev => prev + 1);

    if (activeExerciseIndex < currentWorkout.exercises.length - 1) {
      const newIndex = activeExerciseIndex + 1;
      setActiveExerciseIndex(newIndex);
      setupExerciseTimer(currentWorkout.exercises[newIndex]);
      // If the new exercise is rep-based and has rest, start rest timer automatically
      if (!currentWorkout.exercises[newIndex].duration && currentWorkout.exercises[newIndex].rest && currentWorkout.exercises[newIndex].rest > 0) {
        handleStartRestTimer(currentWorkout.exercises[newIndex].rest);
      }
    } else if (activeExerciseIndex === currentWorkout.exercises.length - 1) {
      // Last exercise completed
      calculateSessionStats();
      toast({ title: dict.page.toasts.workoutCompleteTitle, description: dict.page.toasts.workoutCompleteDescription });
      const congratsMsg = dict.page.workoutModal?.workoutCompleteCongrats || "Workout Complete! Well done!";
      setWorkoutCompletionMessage(congratsMsg); // Set base message, stats will be added in render
      if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
    }
  }, [activeExerciseIndex, currentWorkout, dict, setupExerciseTimer, calculateSessionStats, toast, handleStartRestTimer]);

  const handleExerciseTimerEnd = useCallback(() => {
    if (!dict?.page?.toasts?.exerciseTimeUpTitle || !dict?.page?.toasts?.exerciseTimeUpDescription) return;

    setIsExerciseTimerRunning(false);
    setIsExerciseTimerPaused(false);
    setCanStartRest(true); // Allow rest or next exercise after timed exercise finishes

    toast({ title: dict.page.toasts.exerciseTimeUpTitle, description: dict.page.toasts.exerciseTimeUpDescription });

    // Automatically start rest if available, or move to next exercise if no rest
    if (currentExerciseDetails?.rest && currentExerciseDetails.rest > 0) {
      handleStartRestTimer(currentExerciseDetails.rest);
    } else {
      // If no rest, automatically move to next exercise
      handleNextExercise();
    }
  }, [toast, dict, currentExerciseDetails, handleStartRestTimer, handleNextExercise]);


  // Load workout from history
  useEffect(() => {
    if (historyLoaded && workoutHistory.length > 0 && workoutId && dict) {
      const foundWorkout = workoutHistory.find(w => w.id === workoutId);
      if (foundWorkout) {
        setCurrentWorkout(foundWorkout);
        if (foundWorkout.exercises.length > 0) {
          setupExerciseTimer(foundWorkout.exercises[0]);
          setSessionStartTime(new Date()); // Start session timer when workout is loaded
        } else {
          setError(dict.page?.errors?.emptyAIPlan || "This workout plan has no exercises.");
        }
      } else {
        setError(dict.page?.errors?.workoutNotFound || "Workout not found in history.");
      }
    } else if (historyLoaded && !workoutId) {
      setError(dict?.page?.errors?.noWorkoutId || "No workout ID provided.");
    }
  }, [historyLoaded, workoutHistory, workoutId, dict, setupExerciseTimer]);


  useEffect(() => {
    if (isExerciseTimerRunning && !isExerciseTimerPaused && exerciseTimeLeft !== null && exerciseTimeLeft > 0) {
      exerciseIntervalRef.current = setInterval(() => {
        setExerciseTimeLeft(prevTime => (prevTime !== null && prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    } else {
      if (exerciseIntervalRef.current) {
        clearInterval(exerciseIntervalRef.current);
      }
    }
    return () => {
      if (exerciseIntervalRef.current) {
        clearInterval(exerciseIntervalRef.current);
      }
    };
  }, [isExerciseTimerRunning, isExerciseTimerPaused, exerciseTimeLeft]);

  useEffect(() => {
    if (exerciseTimeLeft === 0 && isExerciseTimerRunning && isCurrentExerciseTimed && !workoutCompletionMessage) {
      handleExerciseTimerEnd();
    }
  }, [exerciseTimeLeft, isExerciseTimerRunning, isCurrentExerciseTimed, workoutCompletionMessage, handleExerciseTimerEnd]);


  const handlePreviousExercise = () => {
    if (activeExerciseIndex > 0 && currentWorkout) {
      const newIndex = activeExerciseIndex - 1;
      setActiveExerciseIndex(newIndex);
      setupExerciseTimer(currentWorkout.exercises[newIndex]);
      setIsRestTimerRunning(false); // Stop rest timer if going back
      setRestTimerDuration(0);
      setRestTimerKey(prev => prev + 1);
    }
  };

  const handleEndWorkout = () => {
    if (!dict?.page?.toasts) return;

    if (!workoutCompletionMessage) { // If workout not completed naturally
      calculateSessionStats();
      toast({ title: dict.page.toasts.workoutEndedTitle, description: dict.page.toasts.workoutEndedDescription });
      const endedMsg = dict.page.toasts.workoutEndedDescription || "Your workout session has ended early.";
      setWorkoutCompletionMessage(endedMsg);
    }

    if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
    setExerciseTimeLeft(null);
    setIsExerciseTimerRunning(false);
    setIsExerciseTimerPaused(false);
    setIsCurrentExerciseTimed(false);
    setCanStartRest(false);

    setIsRestTimerRunning(false);
    setRestTimerDuration(0);
    setRestTimerKey(prev => prev + 1);

    // router.push(`/${lang}`); // Navigate back to the main page after showing completion message
  };

  const handleToggleExerciseTimerPause = () => {
    setIsExerciseTimerPaused(prev => !prev);
    setIsExerciseTimerRunning(prev => !prev);
  };

  const handleRestTimerToggle = () => {
    setIsRestTimerRunning(!isRestTimerRunning);
  };

  const handleRestTimerReset = () => {
    setIsRestTimerRunning(false);
    setRestTimerKey(prev => prev + 1);
    // Optionally, reset timeLeft to initialDuration if the timer is visible
    // setTimeLeft(initialDuration); // This would require passing initialDuration to this component's state
  };

  const handleRestTimerEnd = useCallback(() => {
    if (!dict?.page?.toasts?.restOverTitle || !dict?.page?.toasts?.restOverDescription) return;
    setIsRestTimerRunning(false);
    toast({ title: dict.page.toasts.restOverTitle, description: dict.page.toasts.restOverDescription });

    // Automatically move to the next exercise after rest
    handleNextExercise();
  }, [toast, dict, handleNextExercise]);

  const handleSkipRest = useCallback(() => {
    setIsRestTimerRunning(false);
    setRestTimerDuration(0); // Ensure duration is reset
    setRestTimerKey(prev => prev + 1); // Force re-render/reset
    handleNextExercise(); // Immediately move to the next exercise
  }, [handleNextExercise]);

  if (!historyLoaded) {
    return <div className="flex justify-center items-center min-h-screen">{dict?.page?.loadingText || "Loading..."}</div>;
  }

  if (error) {
    return (
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex justify-center items-center">
        <Alert variant="destructive" className="shadow-md max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{dict.page?.errors?.alertTitle || "Error"}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => router.push(`/${lang}`)} className="mt-4 w-full">
            {dict.page?.errors?.backToHome || "Back to Home"}
          </Button>
        </Alert>
      </main>
    );
  }

  if (!currentWorkout || !currentExerciseDetails) {
    return (
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex justify-center items-center">
        <p>{dict.page?.workoutLoadingDisplay?.title || "Loading workout details..."}</p>
      </main>
    );
  }

  const formatDuration = (seconds: number | null) => {
    if (seconds === null || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/${lang}`)} 
            className="text-muted-foreground hover:text-foreground px-2"
            aria-label={dict.page?.activeWorkoutPage?.backToGeneratorButton || "Back to Workout Generator"}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">{dict.page?.activeWorkoutPage?.backToGeneratorButton || "Back to Workout Generator"}</span>
            <span className="sm:hidden">{dict.page?.activeWorkoutPage?.backToGeneratorButton?.split(' ')[0] || "Back"}</span> {/* Shorter text for small screens */}
          </Button>
          <h1 className="text-3xl font-bold text-center flex-grow font-headline">
            {workoutCompletionMessage
              ? (dict.page?.workoutModal?.workoutCompleteTitle || "Workout Finished!")
              : (dict.page?.activeWorkoutPage?.title || "Active Workout Session")}
          </h1>
          {/* Placeholder to balance the flex layout if needed, or remove if not */}
          <div className="w-[100px] sm:w-[200px] invisible"></div> {/* Adjust width as needed */}
        </div>

        {workoutCompletionMessage ? (
          <div className="py-8 space-y-4 text-center max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg">
            <PartyPopper className="h-20 w-20 text-green-500 mx-auto" />
            <p className="text-xl font-semibold">{workoutCompletionMessage}</p>
            {totalSessionDuration !== null && (
              <p className="text-base text-muted-foreground">
                {(dict.page?.workoutModal?.totalSessionTime || "Total Session Time: {time}").replace('{time}', formatDuration(totalSessionDuration))}
              </p>
            )}
            {estimatedKcalBurned !== null && (
              <p className="text-base text-muted-foreground">
                {(dict.page?.workoutModal?.estimatedKcal || "Estimated Kcal Burned: {kcal}").replace('{kcal}', estimatedKcalBurned.toString())}
              </p>
            )}
            <Button type="button" onClick={() => router.push(`/${lang}`)} className="mt-6 w-full">
              {dict.page?.workoutModal?.closeButton || "Close"}
            </Button>
          </div>
        ) : (
          // Conditional rendering: show RestTimer if it's running, otherwise show ActiveWorkoutDisplay
          isRestTimerRunning ? (
            <div className="pb-4 px-4">
              <RestTimer
                initialDuration={restTimerDuration}
                isRunning={isRestTimerRunning}
                onToggle={handleRestTimerToggle}
                onReset={handleRestTimerReset}
                onTimerEnd={handleRestTimerEnd}
                onSkip={handleSkipRest} // Pass the new skip handler
                timerKey={restTimerKey}
                dict={dict.page?.restTimer || {}}
              />
            </div>
          ) : (
            <ActiveWorkoutDisplay
              workoutPlan={currentWorkout}
              currentExercise={currentExerciseDetails}
              currentExerciseIndex={activeExerciseIndex}
              onNextExercise={handleNextExercise}
              onPreviousExercise={handlePreviousExercise}
              onEndWorkout={handleEndWorkout}
              dict={dict.page?.activeWorkoutDisplay || {}}
              exerciseTimeLeft={exerciseTimeLeft}
              isExerciseTimerRunning={isExerciseTimerRunning}
              isExerciseTimerPaused={isExerciseTimerPaused}
              isCurrentExerciseTimed={isCurrentExerciseTimed}
              canStartRest={canStartRest}
              onToggleExerciseTimerPause={handleToggleExerciseTimerPause}
            />
          )
        )}
      </main>

      <FitnessChatbotDialog dict={dict.page?.chatbot || {}}>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground hover:scale-105 transition-transform"
          aria-label={dict.page?.chatbot?.dialogTitle || "Open Fitness Chatbot"}
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      </FitnessChatbotDialog>
    </>
  );
}