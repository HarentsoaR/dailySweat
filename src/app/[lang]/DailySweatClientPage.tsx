"use client";

import { adjustWorkoutDifficulty, type AdjustWorkoutDifficultyInput } from "@/ai/flows/adjust-workout-difficulty";
import { generateWorkout, type GenerateWorkoutInput as FlowGenerateWorkoutInput } from "@/ai/flows/generate-workout";
import { ActiveWorkoutDisplay } from "@/components/daily-sweat/ActiveWorkoutDisplay";
import { DifficultyFeedback } from "@/components/daily-sweat/DifficultyFeedback";
import { FitnessChatbotDialog } from "@/components/daily-sweat/FitnessChatbotDialog";
import { Header } from "@/components/daily-sweat/Header";
import { RestTimer } from "@/components/daily-sweat/RestTimer";
import { WorkoutDisplay } from "@/components/daily-sweat/WorkoutDisplay";
import { WorkoutGeneratorForm } from "@/components/daily-sweat/WorkoutGeneratorForm";
import { WorkoutHistoryDisplay } from "@/components/daily-sweat/WorkoutHistoryDisplay";
import { WorkoutLoadingDisplay } from "@/components/daily-sweat/WorkoutLoadingDisplay"; // New import
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import type { AIParsedWorkoutOutput, DifficultyFeedbackOption, WorkoutPlan, DictionaryType, GenerateWorkoutInput, Exercise } from "@/lib/types";
import { AlertCircle, DumbbellIcon, History, MessageSquare, PartyPopper } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";

type Lang = 'en' | 'fr' | 'es' | 'it' | 'zh';

interface DailySweatClientPageProps {
  params: { lang: Lang };
  dictionary: DictionaryType;
}

export default function DailySweatClientPage({ params, dictionary: dict }: DailySweatClientPageProps) {
  const [currentWorkoutParams, setCurrentWorkoutParams] = useState<GenerateWorkoutInput | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const { history: workoutHistory, addWorkoutToHistory, clearHistory, removeWorkoutFromHistory, isLoaded: historyLoaded } = useWorkoutHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rest Timer State
  const [timerDuration, setTimerDuration] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  // Workout Session State
  const [isWorkoutSessionActive, setIsWorkoutSessionActive] = useState(false);
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


  const { toast } = useToast();

  const handleGenerateWorkout = async (formValues: GenerateWorkoutInput) => {
    if (!dict?.page?.errors || !dict?.page?.toasts) return;
    setIsLoading(true);
    setError(null);
    setCurrentWorkout(null);
    setIsWorkoutSessionActive(false);
    setWorkoutCompletionMessage(null);

    const minLoadingTime = 4000; // Minimum 4 seconds loading time
    const startTime = Date.now();

    try {
      const payloadForAI: FlowGenerateWorkoutInput = {
        muscleGroups: formValues.muscleGroups,
        availableTime: formValues.availableTime,
        equipment: formValues.equipment,
        difficulty: formValues.difficulty,
        language: params.lang,
      };

      const [result] = await Promise.all([
        generateWorkout(payloadForAI),
        new Promise(resolve => setTimeout(resolve, Math.max(0, minLoadingTime - (Date.now() - startTime))))
      ]);
      
      let parsedPlan: AIParsedWorkoutOutput;
      try {
        parsedPlan = JSON.parse(result.workoutPlan) as AIParsedWorkoutOutput;
      } catch (e) {
        console.error("Failed to parse AI workout plan string:", e);
        setError(dict.page.errors.invalidAIPlan || "Received an invalid workout plan format from AI.");
        setIsLoading(false);
        return;
      }

      if (!parsedPlan.exercises || parsedPlan.exercises.length === 0) {
         setError(dict.page.errors.emptyAIPlan || "The AI generated an empty workout plan.");
         setIsLoading(false);
         return;
      }

      const newWorkout: WorkoutPlan = {
        id: Date.now().toString(),
        name: parsedPlan.name || `${formValues.difficulty} ${formValues.muscleGroups} Workout`,
        muscleGroups: formValues.muscleGroups,
        availableTime: formValues.availableTime,
        equipment: formValues.equipment,
        difficulty: formValues.difficulty,
        exercises: parsedPlan.exercises,
        generatedAt: new Date().toISOString(),
        description: parsedPlan.description,
      };
      setCurrentWorkout(newWorkout);
      setCurrentWorkoutParams(formValues);
      addWorkoutToHistory(newWorkout);
      toast({ title: dict.page.toasts.workoutGeneratedTitle, description: dict.page.toasts.workoutGeneratedDescription });
    } catch (err) {
      console.error("Error generating workout:", err);
      setError(dict.page.errors.failedToGenerate || "Failed to generate workout.");
      toast({ variant: "destructive", title: dict.page.toasts.generationFailedTitle, description: dict.page.toasts.generationFailedDescription });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustDifficulty = async (feedback: DifficultyFeedbackOption) => {
    if (!dict?.page?.errors || !dict?.page?.toasts) return;
    if (!currentWorkout) {
      setError(dict.page.errors.noWorkoutToAdjust || "No current workout to adjust.");
      return;
    }
    setIsAdjusting(true);
    setError(null);

    const minLoadingTime = 2000; // Minimum 2 seconds loading time for adjustment
    const startTime = Date.now();

    try {
      const payloadForAI: AdjustWorkoutDifficultyInput = {
        workoutPlan: JSON.stringify(currentWorkout), 
        feedback,
        language: params.lang,
      };
      const [result] = await Promise.all([
        adjustWorkoutDifficulty(payloadForAI),
        new Promise(resolve => setTimeout(resolve, Math.max(0, minLoadingTime - (Date.now() - startTime))))
      ]);

      let adjustedPlanParsed: AIParsedWorkoutOutput;
      try {
        adjustedPlanParsed = JSON.parse(result.adjustedWorkoutPlan) as AIParsedWorkoutOutput;
      } catch (e) {
        console.error("Failed to parse AI adjusted workout plan string:", e);
        setError(dict.page.errors.invalidAdjustedAIPlan || "Received an invalid adjusted workout plan format from AI.");
        setIsAdjusting(false);
        return;
      }

      if (!adjustedPlanParsed.exercises || adjustedPlanParsed.exercises.length === 0) {
        setError(dict.page.errors.emptyAdjustedAIPlan || "The AI adjusted to an empty workout plan.");
        setIsAdjusting(false);
        return;
      }

      const adjustedWorkout: WorkoutPlan = {
        ...currentWorkout,
        id: Date.now().toString(),
        name: adjustedPlanParsed.name || currentWorkout.name,
        description: adjustedPlanParsed.description || currentWorkout.description,
        exercises: adjustedPlanParsed.exercises,
        originalPlanId: currentWorkout.id,
        feedbackGiven: feedback,
        generatedAt: new Date().toISOString(),
      };

      setCurrentWorkout(adjustedWorkout);
      addWorkoutToHistory(adjustedWorkout);
      toast({ title: dict.page.toasts.workoutAdjustedTitle, description: (dict.page.toasts.workoutAdjustedDescription || "Difficulty perception: {feedback}. Plan updated.").replace('{feedback}', feedback) });
    } catch (err) {
      console.error("Error adjusting workout difficulty:", err);
      setError(dict.page.errors.failedToAdjust || "Failed to adjust workout difficulty.");
      toast({ variant: "destructive", title: dict.page.toasts.adjustmentFailedTitle, description: dict.page.toasts.adjustmentFailedDescription });
    } finally {
      setIsAdjusting(false);
    }
  };

  const setupExerciseTimer = (exercise: Exercise | null) => {
    if (exerciseIntervalRef.current) {
      clearInterval(exerciseIntervalRef.current);
    }
    console.log("Setting up exercise timer for:", exercise); // DEBUG LOG
    if (exercise && typeof exercise.duration === 'number' && exercise.duration > 0) {
      console.log("Exercise IS timed. Duration:", exercise.duration); // DEBUG LOG
      setCurrentExerciseDetails(exercise);
      setExerciseTimeLeft(exercise.duration);
      setIsCurrentExerciseTimed(true);
      setIsExerciseTimerRunning(true); 
      setIsExerciseTimerPaused(false);
      setCanStartRest(false);
    } else {
      console.log("Exercise IS NOT timed or duration is invalid. Duration:", exercise?.duration); // DEBUG LOG
      setCurrentExerciseDetails(exercise);
      setExerciseTimeLeft(null);
      setIsCurrentExerciseTimed(false);
      setIsExerciseTimerRunning(false);
      setIsExerciseTimerPaused(false);
      setCanStartRest(true); 
    }
  };

  const handleStartWorkout = () => {
    if (!dict?.page?.errors || !dict?.page?.toasts) return;
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      setIsWorkoutSessionActive(true);
      setActiveExerciseIndex(0);
      setupExerciseTimer(currentWorkout.exercises[0]);
      setWorkoutCompletionMessage(null);
      setError(null);
      toast({title: dict.page.toasts.workoutStartedTitle, description: dict.page.toasts.workoutStartedDescription});
    } else {
      setError(dict.page.errors.cannotStartEmptyWorkout || "Cannot start an empty workout.");
    }
  };
  
  const handleNextExercise = () => {
    if (!dict?.page?.toasts || !currentWorkout) return;
    if (activeExerciseIndex < currentWorkout.exercises.length - 1) {
      const newIndex = activeExerciseIndex + 1;
      setActiveExerciseIndex(newIndex);
      setupExerciseTimer(currentWorkout.exercises[newIndex]);
    } else if (activeExerciseIndex === currentWorkout.exercises.length - 1) {
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
    setIsWorkoutSessionActive(false);
    setWorkoutCompletionMessage(null); 
    if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
    setExerciseTimeLeft(null);
    setIsExerciseTimerRunning(false);
    setIsExerciseTimerPaused(false);
    toast({ title: dict.page.toasts.workoutEndedTitle, description: dict.page.toasts.workoutEndedDescription });
  };

  const handleToggleExerciseTimerPause = () => {
    setIsExerciseTimerPaused(prev => !prev);
    setIsExerciseTimerRunning(prev => !prev); 
  };

  const handleExerciseTimerEnd = useCallback(() => {
    const canToast = dict?.page?.toasts?.exerciseTimeUpTitle && dict?.page?.toasts?.exerciseTimeUpDescription;

    setIsExerciseTimerRunning(false);
    setIsExerciseTimerPaused(false);
    setCanStartRest(true);

    if (canToast) {
      toast({ title: dict.page.toasts.exerciseTimeUpTitle!, description: dict.page.toasts.exerciseTimeUpDescription! });
    }
  }, [toast, dict?.page?.toasts?.exerciseTimeUpTitle, dict?.page?.toasts?.exerciseTimeUpDescription]);

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


  const handleStartRestTimer = (duration: number) => {
    setTimerDuration(duration);
    setIsTimerRunning(true);
    setTimerKey(prev => prev + 1);
  };

  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimerKey(prev => prev + 1);
  };

  const handleTimerEnd = useCallback(() => {
    if (!dict?.page?.toasts?.restOverTitle || !dict?.page?.toasts?.restOverDescription) return;
    setIsTimerRunning(false);
    toast({ title: dict.page.toasts.restOverTitle, description: dict.page.toasts.restOverDescription });
  }, [toast, dict?.page?.toasts?.restOverTitle, dict?.page?.toasts?.restOverDescription]);


  const handleLoadWorkoutFromHistory = (workout: WorkoutPlan) => {
    if (!dict?.page?.toasts) return;
    setCurrentWorkout(workout);
    const loadedParams: GenerateWorkoutInput = {
        muscleGroups: workout.muscleGroups,
        availableTime: workout.availableTime,
        equipment: workout.equipment,
        difficulty: workout.difficulty,
    };
    setCurrentWorkoutParams(loadedParams);
    setIsWorkoutSessionActive(false);
    setWorkoutCompletionMessage(null);
    if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
    setExerciseTimeLeft(null);
    toast({ title: dict.page.toasts.workoutLoadedTitle, description: (dict.page.toasts.workoutLoadedDescription || "Loaded \"{name}\" from history.").replace('{name}', workout.name)});
  };

  const defaultGeneratorValues: GenerateWorkoutInput = currentWorkoutParams || {
      muscleGroups: 'Full Body',
      availableTime: 30,
      equipment: 'Bodyweight',
      difficulty: 'beginner' as const,
  };

  useEffect(() => {
    if (isLoading || isAdjusting) {
      setError(null);
    }
  }, [isLoading, isAdjusting]);
  
  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      handleEndWorkout();
    } else {
        if (currentWorkout && currentWorkout.exercises.length > 0 && !isWorkoutSessionActive) {
             handleStartWorkout();
        }
    }
  };


  if (!dict) {
    return <div className="flex justify-center items-center min-h-screen">{dict?.page?.loadingText || "Loading..."}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title={dict.header?.title || "Daily Sweat"} />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="workout" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 md:w-1/2 mx-auto">
            <TabsTrigger value="workout" className="font-headline text-base">
                <DumbbellIcon className="mr-2 h-4 w-4" />
                {dict.page?.tabs?.workout || "Workout"}
            </TabsTrigger>
            <TabsTrigger value="history" className="font-headline text-base">
                <History className="mr-2 h-4 w-4" />
                {dict.page?.tabs?.history || "History"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section aria-labelledby="workout-generator-heading">
                <h2 id="workout-generator-heading" className="sr-only">{dict.page?.workoutGenerator?.title || "Workout Generator"}</h2>
                <WorkoutGeneratorForm
                  onSubmit={handleGenerateWorkout}
                  isLoading={isLoading}
                  defaultValues={defaultGeneratorValues}
                  dict={dict.page?.workoutGenerator || {}}
                />
              </section>

              <section aria-labelledby="current-workout-heading" className="space-y-6">
                <h2 id="current-workout-heading" className="sr-only">{dict.page?.workoutDisplay?.title || "Current Workout"}</h2>
                {error && (
                  <Alert variant="destructive" className="shadow-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{dict.page?.errors?.alertTitle || "Error"}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {isLoading ? (
                  <WorkoutLoadingDisplay dict={dict.page?.workoutLoadingDisplay || {}} />
                ) : (
                  <WorkoutDisplay
                    workoutPlan={currentWorkout}
                    // onStartRest={handleStartRestTimer} // Removed
                    onStartWorkout={handleStartWorkout} 
                    isWorkoutActive={isWorkoutSessionActive} 
                    dict={dict.page?.workoutDisplay || {}}
                    exerciseCardDict={dict.page?.exerciseCard || {}}
                  />
                )}
                {currentWorkout && !isWorkoutSessionActive && (
                  <DifficultyFeedback
                    onFeedbackSubmit={handleAdjustDifficulty}
                    isLoading={isAdjusting}
                    disabled={!currentWorkout}
                    dict={dict.page?.difficultyFeedback || {}}
                  />
                )}
              </section>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <section aria-labelledby="workout-history-heading">
              <h2 id="workout-history-heading" className="sr-only">{dict.page?.workoutHistory?.title || "Workout History"}</h2>
              {historyLoaded ? (
                <WorkoutHistoryDisplay
                  history={workoutHistory}
                  onLoadWorkout={handleLoadWorkoutFromHistory}
                  onDeleteWorkout={removeWorkoutFromHistory}
                  onClearHistory={clearHistory}
                  dict={dict.page?.workoutHistory || {}}
                />
              ) : (
                <p>{dict.page?.workoutHistory?.loading || "Loading history..."}</p>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {isWorkoutSessionActive && currentWorkout && currentExerciseDetails && (
        <Dialog open={isWorkoutSessionActive} onOpenChange={handleModalOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {workoutCompletionMessage 
                  ? (dict.page?.workoutModal?.workoutCompleteTitle || "Workout Finished!") 
                  : (dict.page?.workoutModal?.activeWorkoutModalTitle || "Active Workout Session")}
              </DialogTitle>
              {!workoutCompletionMessage && currentWorkout.description && (
                <DialogDescription>
                  {currentWorkout.name}
                </DialogDescription>
              )}
            </DialogHeader>
            
            {workoutCompletionMessage ? (
              <div className="py-4 space-y-3 text-center">
                <PartyPopper className="h-16 w-16 text-green-500 mx-auto" />
                {workoutCompletionMessage.split('\n').map((line, index) => (
                  <p key={index} className={index === 0 ? "text-lg font-semibold" : "text-sm text-muted-foreground"}>{line}</p>
                ))}
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
                modalDict={dict.page?.workoutModal || {}}
              />
            )}

            {workoutCompletionMessage && (
              <DialogFooter className="sm:justify-center">
                <Button type="button" onClick={handleEndWorkout}>
                  {dict.page?.workoutModal?.closeButton || "Close"}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}


      {timerDuration > 0 && (
        <div id="rest-timer-section" className="pb-4 px-4">
             <RestTimer
                initialDuration={timerDuration}
                isRunning={isTimerRunning}
                onToggle={handleTimerToggle}
                onReset={handleTimerReset}
                onTimerEnd={handleTimerEnd}
                timerKey={timerKey}
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