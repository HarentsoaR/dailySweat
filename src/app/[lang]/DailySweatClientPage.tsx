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
import { translateWorkoutPlan, type TranslateWorkoutPlanInput } from "@/ai/flows/translate-workout-plan";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import type { AIParsedWorkoutOutput, DifficultyFeedbackOption, WorkoutPlan, DictionaryType, GenerateWorkoutInput } from "@/lib/types";
import { AlertCircle, DumbbellIcon, History, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { BottomTabBar } from "@/components/daily-sweat/BottomTabBar";

type Lang = 'en' | 'fr' | 'es' | 'it' | 'zh';

interface DailySweatClientPageProps {
  dictionary: DictionaryType;
  params?: { lang: Lang };
}

export default function DailySweatClientPage({ dictionary: dict }: DailySweatClientPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const langRaw = routeParams.lang as string;
  const supportedLangs = ['en','fr','es','it','zh'] as const;
  const lang: Lang = (supportedLangs as readonly string[]).includes(langRaw) ? (langRaw as Lang) : 'en';

  // Lightweight language detector for EN/ES/FR/IT/zh used to enforce output locale
  const detectLanguage = (text: string): Lang | 'unknown' => {
    const t = (text || '').toLowerCase();
    if (!t.trim()) return 'unknown';
    if (/[\u3400-\u9FBF\uF900-\uFAFF]/.test(t)) return 'zh';
    const scores: Record<Lang, number> = { en: 0, es: 0, fr: 0, it: 0, zh: 0 };
    const add = (l: Lang, re: RegExp) => { const m = t.match(re); if (m) scores[l] += m.length; };
    add('en', /\b(the|and|with|for|of|workout|push[- ]?ups|plank|squats|rest)\b/g);
    add('es', /\b(el|la|los|las|con|para|de|y|entrenamiento|flexiones|sentadillas|plancha|cuerpo)\b/g);
    add('fr', /\b(le|la|les|des|du|de|et|avec|pour|entraîne?ment|pompes|squats|planche)\b/g);
    add('it', /\b(il|lo|la|gli|le|con|per|di|allenamento|flessioni|affondi|panca|plancia)\b/g);
    const entries = Object.entries(scores) as [Lang, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const [topLang, topScore] = entries[0];
    const [secondLang, secondScore] = entries[1];
    if (topScore >= 2 && topScore >= (secondScore + 1)) return topLang;
    return 'unknown';
  };
  
  const [currentWorkoutParams, setCurrentWorkoutParams] = useState<GenerateWorkoutInput | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const { history: workoutHistory, addWorkoutToHistory, clearHistory, removeWorkoutFromHistory, isLoaded: historyLoaded } = useWorkoutHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("workout"); // New state for active tab
  const [isStarting, setIsStarting] = useState(false); // pre-navigation loading

  const { toast } = useToast();

  const handleGenerateWorkout = async (formValues: GenerateWorkoutInput) => {
    if (!dict?.page?.errors || !dict?.page?.toasts) return;
    setIsLoading(true);
    setError(null);
    setCurrentWorkout(null);
    setSelectedTab("workout"); // Ensure we are on the workout tab after generation

    const minLoadingTime = 4000; // Minimum 4 seconds loading time
    const startTime = Date.now();

    try {
      const payloadForAI: FlowGenerateWorkoutInput = {
        muscleGroups: formValues.muscleGroups,
        availableTime: formValues.availableTime,
        equipment: formValues.equipment,
        difficulty: formValues.difficulty,
        language: lang,
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

      // Language enforcement fallback: detect output language and translate to the route's lang when mismatched.
      const sample = `${parsedPlan.name || ''} ${parsedPlan.description || ''} ${parsedPlan.exercises?.[0]?.name || ''}`;
      const detected = detectLanguage(sample);
      if (detected !== 'unknown' && detected !== lang) {
        try {
          const translated = await translateWorkoutPlan({ workoutPlan: JSON.stringify(parsedPlan), language: lang } as TranslateWorkoutPlanInput);
          parsedPlan = JSON.parse(translated.translatedWorkoutPlan) as AIParsedWorkoutOutput;
        } catch (e) {
          console.warn('Translate fallback failed, proceeding with original plan.', e);
        }
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
        language: lang,
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

      // Language enforcement for adjusted plans as well
      try {
        const sampleAdj = `${adjustedPlanParsed.name || ''} ${adjustedPlanParsed.description || ''} ${adjustedPlanParsed.exercises?.[0]?.name || ''}`;
        const detectedAdj = detectLanguage(sampleAdj);
        if (detectedAdj !== 'unknown' && detectedAdj !== lang) {
          const translatedAdj = await translateWorkoutPlan({ workoutPlan: JSON.stringify(adjustedPlanParsed), language: lang } as TranslateWorkoutPlanInput);
          adjustedPlanParsed = JSON.parse(translatedAdj.translatedWorkoutPlan) as AIParsedWorkoutOutput;
        }
      } catch { /* non-fatal; keep original adjusted plan */ }

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

  const handleStartWorkout = async () => {
    if (!dict?.page?.errors || !dict?.page?.toasts) return;
    if (currentWorkout && currentWorkout.exercises.length > 0) {
      const targetPath = `/${lang}/workout/${currentWorkout.id}`;
      setIsStarting(true);
      const minDelay = 900;
      await new Promise(resolve => setTimeout(resolve, minDelay));
      router.push(targetPath);
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
    setSelectedTab("workout"); // Switch to workout tab
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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title={dict.header?.title || "Daily Sweat"} />
      <main id="main" className="flex-grow container mx-auto px-4 py-8 sm:px-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
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
                  lang={lang}
                />
              </section>

              <section
                aria-labelledby="current-workout-heading"
                className="space-y-6"
                aria-live="polite"
                aria-atomic="false"
                aria-busy={isLoading}
                role="status"
              >
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
                    onRegenerate={async (hint) => {
                      if (!currentWorkoutParams) return;
                      setIsRegenerating(true);
                      setError(null);
                      try {
                        const payloadForAI: FlowGenerateWorkoutInput = {
                          muscleGroups: currentWorkoutParams.muscleGroups,
                          availableTime: currentWorkoutParams.availableTime,
                          equipment: currentWorkoutParams.equipment,
                          difficulty: currentWorkoutParams.difficulty,
                          language: lang,
                          emphasisHint: hint,
                        };
                        const minLoadingTime = 2000;
                        const startTime = Date.now();
                        const [result] = await Promise.all([
                          generateWorkout(payloadForAI),
                          new Promise(resolve => setTimeout(resolve, Math.max(0, minLoadingTime - (Date.now() - startTime))))
                        ]);
                        let parsedPlan: AIParsedWorkoutOutput;
                        try {
                          parsedPlan = JSON.parse(result.workoutPlan) as AIParsedWorkoutOutput;
                        } catch (e) {
                          setError(dict?.page?.errors?.invalidAIPlan || "Received an invalid workout plan format from AI.");
                          return;
                        }
                        // Language enforcement fallback for regeneration
                        try {
                          const translated = await translateWorkoutPlan({ workoutPlan: JSON.stringify(parsedPlan), language: lang } as TranslateWorkoutPlanInput);
                          parsedPlan = JSON.parse(translated.translatedWorkoutPlan) as AIParsedWorkoutOutput;
                        } catch (e) { /* non-fatal */ }
                        const newWorkout: WorkoutPlan = {
                          id: Date.now().toString(),
                          name: parsedPlan.name || `${currentWorkoutParams.difficulty} ${currentWorkoutParams.muscleGroups} Workout`,
                          muscleGroups: currentWorkoutParams.muscleGroups,
                          availableTime: currentWorkoutParams.availableTime,
                          equipment: currentWorkoutParams.equipment,
                          difficulty: currentWorkoutParams.difficulty,
                          exercises: parsedPlan.exercises,
                          generatedAt: new Date().toISOString(),
                          description: parsedPlan.description,
                        };
                        setCurrentWorkout(newWorkout);
                        addWorkoutToHistory(newWorkout);
                        toast({ title: dict?.page?.toasts?.workoutGeneratedTitle, description: (dict?.page?.toasts?.workoutGeneratedDescription || "New variation generated.")});
                      } finally {
                        setIsRegenerating(false);
                      }
                    }}
                    isRegenerating={isRegenerating}
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
                  lang={lang}
                  onUseSuggestedParams={(params) => {
                    setCurrentWorkoutParams(params);
                    setSelectedTab('workout');
                    toast({ title: dict.page?.toasts?.workoutLoadedTitle || 'Plan loaded', description: 'Suggested parameters applied. Ready to generate.' });
                  }}
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
          className="fixed right-6 h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground hover:scale-105 transition-transform bottom-28 md:bottom-6 z-50"
          aria-label={dict.page?.chatbot?.dialogTitle || "Open Fitness Chatbot"}
          title={dict.page?.chatbot?.dialogTitle || "Daily Sweat AI Coach"}
        >
          <MessageSquare className="h-7 w-7" />
          <span aria-hidden className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
        </Button>
      </FitnessChatbotDialog>

      <footer className="text-center py-4 border-t text-sm text-muted-foreground mt-16">
        <p>{(dict.footer?.tagline || "© {year} Daily Sweat. Sweat Smarter, Not Harder.").replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>

      {/* Mobile bottom navigation */}
      <BottomTabBar
        active={selectedTab === "history" ? "history" : "workout"}
        onChange={(tab) => setSelectedTab(tab)}
      />

      {/* Start workout pre-navigation overlay */}
      {isStarting && !isLoading && (
        <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-3 text-primary">
            <span className="spinner" aria-hidden>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </span>
            <p className="text-sm text-muted-foreground" aria-live="polite">{dict.page?.workoutLoadingDisplay?.title || 'Starting Workout'}</p>
          </div>
          <style jsx>{`
            .spinner { position: relative; width: var(--size, 10px); height: var(--size, 10px); display: inline-block; }
            .spinner div { position: absolute; width: 50%; height: 120%; background: currentColor; transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1%)); animation: spinner-fzua35 1s calc(var(--delay) * 1s) infinite ease; border-radius: 1px; }
            .spinner div:nth-child(1)  { --delay: 0.1; --rotation: 36;  --translation: 100; }
            .spinner div:nth-child(2)  { --delay: 0.2; --rotation: 72;  --translation: 100; }
            .spinner div:nth-child(3)  { --delay: 0.3; --rotation: 108; --translation: 100; }
            .spinner div:nth-child(4)  { --delay: 0.4; --rotation: 144; --translation: 100; }
            .spinner div:nth-child(5)  { --delay: 0.5; --rotation: 180; --translation: 100; }
            .spinner div:nth-child(6)  { --delay: 0.6; --rotation: 216; --translation: 100; }
            .spinner div:nth-child(7)  { --delay: 0.7; --rotation: 252; --translation: 100; }
            .spinner div:nth-child(8)  { --delay: 0.8; --rotation: 288; --translation: 100; }
            .spinner div:nth-child(9)  { --delay: 0.9; --rotation: 324; --translation: 100; }
            .spinner div:nth-child(10) { --delay: 1.0; --rotation: 360; --translation: 100; }
            @keyframes spinner-fzua35 {
              0%, 10%, 20%, 30%, 50%, 60%, 70%, 80%, 90%, 100% { transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1%)); }
              50% { transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1.3%)); }
            }
            /* Responsive sizing for spinner (still compact) */
            @media (min-width: 480px) { .spinner { --size: 11px; } }
            @media (min-width: 768px) { .spinner { --size: 12px; } }
            @media (min-width: 1024px){ .spinner { --size: 13px; } }
            /* Simple fade-in animation */
            :global(.animate-fade-in) { animation: fadeIn 180ms ease-out; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
        </div>
      )}
    </div>
  );
}
