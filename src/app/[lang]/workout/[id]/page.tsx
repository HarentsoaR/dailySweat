"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries"; // Client-side dictionary loading
import { ActiveWorkoutDisplay } from "@/components/daily-sweat/ActiveWorkoutDisplay";
import { RestTimer } from "@/components/daily-sweat/RestTimer";
import { FitnessChatbotDialog } from "@/components/daily-sweat/FitnessChatbotDialog";
import { Header } from "@/components/daily-sweat/Header";
import { useToast } from "@/hooks/use-toast";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import type { WorkoutPlan, Exercise, DictionaryType } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, MessageSquare, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lang = 'en' | 'fr' | 'es' | 'it' | 'zh';

interface ActiveWorkoutPageProps {
  params: { lang: Lang; id: string };
}

export default function ActiveWorkoutPage({ params }: ActiveWorkoutPageProps) {
  const router = useRouter();
  const { lang, id: workoutId } = params;
  const { history: workoutHistory, isLoaded: historyLoaded } = useWorkoutHistory();
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const [dict, setDict] = useState<DictionaryType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Workout Session State
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [workoutCompletionMessage, setWorkoutCompletionMessage] = useState<string | null>(null);

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
  const [restTimerKey, setRestTimerKey] = useState(0);

  const { toast } = useToast();

  // Load dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      const loadedDict = await getDictionary(lang);
      setDict(loadedDict);
    };
    loadDictionary();
  }, [lang]);

  // Load workout from history
  useEffect(() => {
    if (historyLoaded && workoutHistory.length > 0 && workoutId && dict) {
      const foundWorkout = workoutHistory.find(w => w.id === workoutId);
      if (foundWorkout) {
        setCurrentWorkout(foundWorkout);
        if (foundWorkout.exercises.length > 0) {
          setupExerciseTimer(foundWorkout.exercises[0]);
        } else {
          setError(dict.page?.errors?.emptyAIPlan || "This workout plan has no exercises.");
        }
      } else {
        setError(dict.page?.errors?.workoutNotFound || "Workout not found in history.");
      }
    } else if (historyLoaded && !workoutId) {
      setError(dict?.page?.errors?.noWorkoutId || "No workout ID provided.");
    }
  }, [historyLoaded, workoutHistory, workoutId, dict]);

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
      setCanStartRest(true);
    }
  }, []);

  const handleExerciseTimerEnd = useCallback(() => {
    if (!dict?.page?.toasts?.exerciseTimeUpTitle || !dict?.page?.toasts?.exerciseTimeUpDescription) return;

    setIsExerciseTimerRunning(false);
    setIsExerciseTimerPaused(false);
    setCanStartRest(true);

    toast({ title: dict.page.toasts.exerciseTimeUpTitle, description: dict.page.toasts.exerciseTimeUpDescription });
  }, [toast, dict]);

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

  const handleNextExercise = () => {
    if (!dict?.page?.toasts || !currentWorkout) return;
    if (activeExerciseIndex < currentWorkout.exercises.length - 1) {
      const newIndex = activeExerciseIndex + 1;
      setActiveExerciseIndex(newIndex);
      setupExerciseTimer(currentWorkout.exercises[newIndex]);
    } else if (activeExerciseIndex === currentWorkout.exercises.length - 1) {
      // Last exercise completed
      toast({ title: dict.page.toasts.workoutCompleteTitle, description: dict.page.toasts.workoutCompleteDescription });
      const congratsMsg = dict.page.workoutModal?.workoutCompleteCongrats || "Workout Complete! Well done!";
      const kcalMsg = dict.page.workoutModal?.kcalBurnedPlaceholder || "Estimated Kcal Burned: Calculation coming soon.";
      setWorkoutCompletionMessage(`${congratsMsg}\n${kcalMsg}`);
      if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
    }
  };

  const handlePreviousExercise = () => {
    if (activeExerciseIndex > 0 && currentWorkout) {
      const newIndex = activeExerciseIndex - 1;
      setActiveExerciseIndex(newIndex);
      setupExerciseTimer(currentWorkout.exercises[newIndex]);
    }
  };

  const handleEndWorkout = () => {
    if (!dict?.page?.toasts) return;

    if (!workoutCompletionMessage) {
      toast({ title: dict.page.toasts.workoutEndedTitle, description: dict.page.toasts.workoutEndedDescription });
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

    router.push(`/${lang}`); // Navigate back to the main page
  };

  const handleToggleExerciseTimerPause = () => {
    setIsExerciseTimerPaused(prev => !prev);
    setIsExerciseTimerRunning(prev => !prev);
  };

  const handleStartRestTimer = (duration: number) => {
    setRestTimerDuration(duration);
    setIsRestTimerRunning(true);
    setRestTimerKey(prev => prev + 1);
  };

  const handleRestTimerToggle = () => {
    setIsRestTimerRunning(!isRestTimerRunning);
  };

  const handleRestTimerReset = () => {
    setIsRestTimerRunning(false);
    setRestTimerKey(prev => prev + 1);
  };

  const handleRestTimerEnd = useCallback(() => {
    if (!dict?.page?.toasts?.restOverTitle || !dict?.page?.toasts?.restOverDescription) return;
    setIsRestTimerRunning(false);
    toast({ title: dict.page.toasts.restOverTitle, description: dict.page.toasts.restOverDescription });
  }, [toast, dict]);

  if (!dict || !historyLoaded) {
    return <div className="flex justify-center items-center min-h-screen">{dict?.page?.loadingText || "Loading..."}</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header title={dict.header?.title || "Daily Sweat"} />
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
        <footer className="text-center py-4 border-t text-sm text-muted-foreground mt-16">
          <p>{(dict.footer?.tagline || "© {year} Daily Sweat. Sweat Smarter, Not Harder.").replace('{year}', new Date().getFullYear().toString())}</p>
        </footer>
      </div>
    );
  }

  if (!currentWorkout || !currentExerciseDetails) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header title={dict.header?.title || "Daily Sweat"} />
        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex justify-center items-center">
          <p>{dict.page?.workoutLoadingDisplay?.title || "Loading workout details..."}</p>
        </main>
        <footer className="text-center py-4 border-t text-sm text-muted-foreground mt-16">
          <p>{(dict.footer?.tagline || "© {year} Daily Sweat. Sweat Smarter, Not Harder.").replace('{year}', new Date().getFullYear().toString())}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title={dict.header?.title || "Daily Sweat"} />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8 font-headline">
          {workoutCompletionMessage
            ? (dict.page?.workoutModal?.workoutCompleteTitle || "Workout Finished!")
            : (dict.page?.activeWorkoutPage?.title || "Active Workout Session")}
        </h1>

        {workoutCompletionMessage ? (
          <div className="py-8 space-y-4 text-center max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg">
            <PartyPopper className="h-20 w-20 text-green-500 mx-auto" />
            {workoutCompletionMessage.split('\n').map((line, index) => (
              <p key={index} className={index === 0 ? "text-xl font-semibold" : "text-base text-muted-foreground"}>{line}</p>
            ))}
            <Button type="button" onClick={handleEndWorkout} className="mt-6 w-full">
              {dict.page?.workoutModal?.closeButton || "Close"}
            </Button>
          </div>
        ) : (
          <ActiveWorkoutDisplay
            workoutPlan={currentWorkout}
            currentExercise={currentExerciseDetails}
            currentExerciseIndex={activeExerciseIndex}
            onNextExercise={handleNextExercise}
            onPreviousExercise={handlePreviousExercise}
            onEndWorkout={handleEndWorkout}
            onStartRest={handleStartRestTimer}
            dict={dict.page?.activeWorkoutDisplay || {}}
            exerciseTimeLeft={exerciseTimeLeft}
            isExerciseTimerRunning={isExerciseTimerRunning}
            isExerciseTimerPaused={isExerciseTimerPaused}
            isCurrentExerciseTimed={isCurrentExerciseTimed}
            canStartRest={canStartRest}
            onToggleExerciseTimerPause={handleToggleExerciseTimerPause}
          />
        )}
      </main>

      {restTimerDuration > 0 && (
        <div id="rest-timer-section" className="pb-4 px-4">
          <RestTimer
            initialDuration={restTimerDuration}
            isRunning={isRestTimerRunning}
            onToggle={handleRestTimerToggle}
            onReset={handleRestTimerReset}
            onTimerEnd={handleRestTimerEnd}
            timerKey={restTimerKey}
            dict={dict.page?.restTimer || {}}
          />
        </div>
      )}

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

      <footer className="text-center py-4 border-t text-sm text-muted-foreground mt-16">
        <p>{(dict.footer?.tagline || "© {year} Daily Sweat. Sweat Smarter, Not Harder.").replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </div>
  );
}