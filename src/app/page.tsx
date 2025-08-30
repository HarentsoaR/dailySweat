
"use client";

import { adjustWorkoutDifficulty, type AdjustWorkoutDifficultyInput } from "@/ai/flows/adjust-workout-difficulty";
import { generateWorkout, type GenerateWorkoutInput } from "@/ai/flows/generate-workout";
import { ActiveWorkoutDisplay } from "@/components/daily-sweat/ActiveWorkoutDisplay";
import { DifficultyFeedback } from "@/components/daily-sweat/DifficultyFeedback";
import { FitnessChatbotDialog } from "@/components/daily-sweat/FitnessChatbotDialog";
import { Header } from "@/components/daily-sweat/Header";
import { RestTimer } from "@/components/daily-sweat/RestTimer";
import { WorkoutDisplay } from "@/components/daily-sweat/WorkoutDisplay";
import { WorkoutGeneratorForm } from "@/components/daily-sweat/WorkoutGeneratorForm";
import { WorkoutHistoryDisplay } from "@/components/daily-sweat/WorkoutHistoryDisplay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import type { AIParsedWorkoutOutput, DifficultyFeedbackOption, WorkoutPlan, GenerateWorkoutInput as FormInput } from "@/lib/types";
import { AlertCircle, DumbbellIcon, History, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// For this non-localized page, we'll default to 'en' for AI interactions.
const DEFAULT_LANGUAGE = 'en';

export default function DailySweatPage() {
  const [currentWorkoutParams, setCurrentWorkoutParams] = useState<FormInput | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const { history: workoutHistory, addWorkoutToHistory, clearHistory, removeWorkoutFromHistory, isLoaded: historyLoaded } = useWorkoutHistory();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timerDuration, setTimerDuration] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const { toast } = useToast();

  const handleGenerateWorkout = async (data: FormInput) => {
    setIsLoading(true);
    setError(null);
    setCurrentWorkout(null);
    setIsWorkoutActive(false); 
    try {
      const result = await generateWorkout({ ...data, language: DEFAULT_LANGUAGE });
      let parsedPlan: AIParsedWorkoutOutput;
      try {
        parsedPlan = JSON.parse(result.workoutPlan) as AIParsedWorkoutOutput;
      } catch (e) {
        console.error("Failed to parse AI workout plan string:", e);
        setError("Received an invalid workout plan format from AI. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!parsedPlan.exercises || parsedPlan.exercises.length === 0) {
         setError("The AI generated an empty workout plan. Please try different parameters.");
         setIsLoading(false);
         return;
      }

      const newWorkout: WorkoutPlan = {
        id: Date.now().toString(),
        name: parsedPlan.name || `${data.difficulty} ${data.muscleGroups} Workout`,
        muscleGroups: data.muscleGroups,
        availableTime: data.availableTime,
        equipment: data.equipment,
        difficulty: data.difficulty,
        exercises: parsedPlan.exercises,
        generatedAt: new Date().toISOString(),
        description: parsedPlan.description,
      };
      setCurrentWorkout(newWorkout);
      setCurrentWorkoutParams(data);
      addWorkoutToHistory(newWorkout);
      toast({ title: "Workout Generated!", description: "Your new workout plan is ready." });
    } catch (err) {
      console.error("Error generating workout:", err);
      setError("Failed to generate workout. Please try again later.");
      toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate workout." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustDifficulty = async (feedback: DifficultyFeedbackOption) => {
    if (!currentWorkout) {
      setError("No current workout to adjust.");
      return;
    }
    setIsAdjusting(true);
    setError(null);
    try {
      const workoutPlanString = JSON.stringify(currentWorkout);
      const result = await adjustWorkoutDifficulty({ workoutPlan: workoutPlanString, feedback, language: DEFAULT_LANGUAGE });
      
      let adjustedPlanParsed: AIParsedWorkoutOutput; 
      try {
        adjustedPlanParsed = JSON.parse(result.adjustedWorkoutPlan) as AIParsedWorkoutOutput; 
      } catch (e) {
        console.error("Failed to parse AI adjusted workout plan string:", e);
        setError("Received an invalid adjusted workout plan format from AI. Please try again.");
        setIsAdjusting(false);
        return;
      }

      if (!adjustedPlanParsed.exercises || adjustedPlanParsed.exercises.length === 0) {
        setError("The AI adjusted to an empty workout plan. Please try different feedback or generate a new plan.");
        setIsAdjusting(false);
        return;
      }

      const adjustedWorkout: WorkoutPlan = {
        ...currentWorkout, 
        name: adjustedPlanParsed.name || currentWorkout.name, 
        description: adjustedPlanParsed.description || currentWorkout.description, 
        exercises: adjustedPlanParsed.exercises, 
        id: Date.now().toString(),
        originalPlanId: currentWorkout.id,
        feedbackGiven: feedback,
        generatedAt: new Date().toISOString(),
      };

      setCurrentWorkout(adjustedWorkout);
      addWorkoutToHistory(adjustedWorkout);
      toast({ title: "Workout Adjusted!", description: `Difficulty perception: ${feedback}. Plan updated.` });
    } catch (err) {
      console.error("Error adjusting workout difficulty:", err);
      setError("Failed to adjust workout difficulty. Please try again.");
      toast({ variant: "destructive", title: "Adjustment Failed", description: "Could not adjust workout." });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleStartRestTimer = (duration: number) => {
    setTimerDuration(duration);
    setIsTimerRunning(true);
    setTimerKey(prev => prev + 1);
    const timerElement = document.getElementById('rest-timer-section');
    if (timerElement) {
      timerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };
  
  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimerKey(prev => prev + 1); 
  };

  const handleTimerEnd = useCallback(() => {
    setIsTimerRunning(false);
    toast({ title: "Rest Over!", description: "Time to get back to it!" });
  }, [toast]);

  const handleLoadWorkoutFromHistory = (workout: WorkoutPlan) => {
    setCurrentWorkout(workout);
    setCurrentWorkoutParams({
        muscleGroups: workout.muscleGroups,
        availableTime: workout.availableTime,
        equipment: workout.equipment,
        difficulty: workout.difficulty,
    });
    setIsWorkoutActive(false); 
    toast({ title: "Workout Loaded", description: `Loaded "${workout.name}" from history.`});
  };

  const defaultGeneratorValues: FormInput = currentWorkoutParams || {
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

  const handleStartWorkout = () => {
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      setIsWorkoutActive(true);
      setActiveExerciseIndex(0);
      setError(null); 
      toast({title: "Workout Started!", description: "Let's get to it!"});
    } else {
      setError("Cannot start an empty or non-existent workout. Please generate a workout first.");
    }
  };

  const handleNextExercise = () => {
    if (currentWorkout && activeExerciseIndex < currentWorkout.exercises.length - 1) {
      setActiveExerciseIndex(prev => prev + 1);
    } else if (currentWorkout && activeExerciseIndex === currentWorkout.exercises.length - 1) {
      toast({ title: "Workout Complete!", description: "Great job finishing your workout!" });
      setIsWorkoutActive(false);
    }
  };
  
  const handlePreviousExercise = () => {
    if (activeExerciseIndex > 0) {
      setActiveExerciseIndex(prev => prev - 1);
    }
  };

  const handleEndWorkout = () => {
    setIsWorkoutActive(false);
    toast({ title: "Workout Ended", description: "Come back soon for another session!" });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="Daily Sweat" />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="workout" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 md:w-1/2 mx-auto">
            <TabsTrigger value="workout" className="font-headline text-base"><DumbbellIcon className="mr-2 h-4 w-4" />Workout</TabsTrigger>
            <TabsTrigger value="history" className="font-headline text-base"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
          </TabsList>

          <TabsContent value="workout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section aria-labelledby="workout-generator-heading">
                <h2 id="workout-generator-heading" className="sr-only">Workout Generator</h2>
                <WorkoutGeneratorForm 
                  onSubmit={handleGenerateWorkout} 
                  isLoading={isLoading}
                  defaultValues={defaultGeneratorValues}
                  dict={{}} // Provide empty dict as this page is not localized
                />
              </section>

              <section aria-labelledby="current-workout-heading" className="space-y-6">
                <h2 id="current-workout-heading" className="sr-only">Current Workout</h2>
                {error && (
                  <Alert variant="destructive" className="shadow-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isWorkoutActive && currentWorkout ? (
                  <ActiveWorkoutDisplay
                    workoutPlan={currentWorkout}
                    currentExercise={currentWorkout.exercises[activeExerciseIndex]}
                    currentExerciseIndex={activeExerciseIndex}
                    onNextExercise={handleNextExercise}
                    onPreviousExercise={handlePreviousExercise}
                    onEndWorkout={handleEndWorkout}
                    onStartRest={handleStartRestTimer}
                    dict={{}} // Provide empty dict
                    modalDict={{}} // Provide empty dict
                    exerciseTimeLeft={null} // Non-timed for this page
                    isExerciseTimerRunning={false}
                    isExerciseTimerPaused={false}
                    isCurrentExerciseTimed={false}
                    canStartRest={true}
                    onToggleExerciseTimerPause={() => {}}
                  />
                ) : (
                  <>
                    <WorkoutDisplay 
                      workoutPlan={currentWorkout} 
                      onStartRest={handleStartRestTimer}
                      onStartWorkout={handleStartWorkout}
                      isWorkoutActive={isWorkoutActive}
                      dict={{}} // Provide empty dict
                      exerciseCardDict={{}} // Provide empty dict
                    />
                    {currentWorkout && !isWorkoutActive && (
                      <DifficultyFeedback 
                        onFeedbackSubmit={handleAdjustDifficulty} 
                        isLoading={isAdjusting}
                        disabled={!currentWorkout}
                        dict={{}} // Provide empty dict
                      />
                    )}
                  </>
                )}
              </section>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <section aria-labelledby="workout-history-heading">
              <h2 id="workout-history-heading" className="sr-only">Workout History</h2>
              {historyLoaded ? (
                <WorkoutHistoryDisplay
                  history={workoutHistory}
                  onLoadWorkout={handleLoadWorkoutFromHistory}
                  onDeleteWorkout={removeWorkoutFromHistory}
                  onClearHistory={clearHistory}
                  dict={{}} // Provide empty dict
                />
              ) : (
                <p>Loading history...</p>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {timerDuration > 0 && (
        <div id="rest-timer-section" className="pb-4 px-4">
             <RestTimer
                initialDuration={timerDuration}
                isRunning={isTimerRunning}
                onToggle={handleTimerToggle}
                onReset={handleTimerReset}
                onTimerEnd={handleTimerEnd}
                timerKey={timerKey}
                dict={{}} // Provide empty dict
             />
        </div>
      )}
      
      <FitnessChatbotDialog dict={{}}>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground hover:scale-105 transition-transform"
          aria-label="Open Fitness Chatbot"
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      </FitnessChatbotDialog>
      
      <footer className="text-center py-4 border-t text-sm text-muted-foreground mt-16">
        <p>&copy; {new Date().getFullYear()} Daily Sweat. Sweat Smarter, Not Harder.</p>
      </footer>
    </div>
  );
}
