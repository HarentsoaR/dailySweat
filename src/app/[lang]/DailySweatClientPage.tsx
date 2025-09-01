"use client";

import { adjustWorkoutDifficulty, type AdjustWorkoutDifficultyInput } from "@/ai/flows/adjust-workout-difficulty";
import { generateWorkout, type GenerateWorkoutInput as FlowGenerateWorkoutInput } from "@/ai/flows/generate-workout";
import { DifficultyFeedback } from "@/components/daily-sweat/DifficultyFeedback";
import { FitnessChatbotDialog } from "@/components/daily-sweat/FitnessChatbotDialog";
import { Header } from "@/components/daily-sweat/Header";
import { WorkoutDisplay } from "@/components/daily-sweat/WorkoutDisplay";
import { WorkoutGeneratorForm } from "@/components/daily-sweat/WorkoutGeneratorForm";
import { WorkoutHistoryDisplay } from "@/components/daily-sweat/WorkoutHistoryDisplay";
import { WorkoutLoadingDisplay } from "@/components/daily-sweat/WorkoutLoadingDisplay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import type { AIParsedWorkoutOutput, DifficultyFeedbackOption, WorkoutPlan, DictionaryType, GenerateWorkoutInput } from "@/lib/types";
import { AlertCircle, DumbbellIcon, History, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Import useParams

type Lang = 'en' | 'fr' | 'es' | 'it' | 'zh';

interface DailySweatClientPageProps {
  // params: { lang: Lang }; // No longer needed as a prop, will use useParams
  dictionary: DictionaryType;
}

export default function DailySweatClientPage({ dictionary: dict }: DailySweatClientPageProps) {
  const router = useRouter(); // Initialize useRouter
  const routeParams = useParams(); // Get params from the hook
  const lang = routeParams.lang as Lang; // Assert type
  
  const [currentWorkoutParams, setCurrentWorkoutParams] = useState<GenerateWorkoutInput | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const { history: workoutHistory, addWorkoutToHistory, clearHistory, removeWorkoutFromHistory, isLoaded: historyLoaded } = useWorkoutHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleGenerateWorkout = async (formValues: GenerateWorkoutInput) => {
    if (!dict?.page?.errors || !dict?.page?.toasts) return;
    setIsLoading(true);
    setError(null);
    setCurrentWorkout(null);

    const minLoadingTime = 4000; // Minimum 4 seconds loading time
    const startTime = Date.now();

    try {
      const payloadForAI: FlowGenerateWorkoutInput = {
        muscleGroups: formValues.muscleGroups,
        availableTime: formValues.availableTime,
        equipment: formValues.equipment,
        difficulty: formValues.difficulty,
        language: lang, // Use lang from useParams
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
        language: lang, // Use lang from useParams
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

  const handleStartWorkout = () => {
    if (!dict?.page?.errors || !dict?.page?.toasts) return;
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      const targetPath = `/${lang}/workout/${currentWorkout.id}`; // Use lang from useParams
      console.log("DEBUG: Attempting to navigate to:", targetPath); // Added debug log
      router.push(targetPath); // Navigate to the new workout page
    } else {
      setError(dict.page.errors.cannotStartEmptyWorkout || "Cannot start an empty workout.");
    }
  };

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
                    onStartWorkout={handleStartWorkout} 
                    isWorkoutActive={false} // No longer active on this page
                    dict={dict.page?.workoutDisplay || {}}
                    exerciseCardDict={dict.page?.exerciseCard || {}}
                  />
                )}
                {currentWorkout && (
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