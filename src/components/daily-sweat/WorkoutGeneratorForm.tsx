
"use client";

import React from 'react';
import type { GenerateWorkoutInput } from '@/lib/types';
import { parseWorkoutRequest } from '@/ai/flows/parse-workout-request';
import { suggestWorkoutDescription } from '@/ai/flows/suggest-workout-description';
import { suggestWorkoutDescriptions } from '@/ai/flows/suggest-workout-descriptions';
import { zodResolver } from '@hookform/resolvers/zod';
import {Clock3, Settings2, Users, Zap, Dumbbell, RefreshCcw, Sparkles } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const workoutGeneratorSchema = z.object({
  muscleGroups: z.string().min(1, 'Please specify muscle groups.'),
  availableTime: z.coerce.number().min(5, 'Minimum 5 minutes.').max(180, 'Maximum 180 minutes.'),
  equipment: z.string().min(1, 'Please list available equipment or "bodyweight".'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

type WorkoutGeneratorFormValues = z.infer<typeof workoutGeneratorSchema>;

interface WorkoutGeneratorFormProps {
  onSubmit: (data: GenerateWorkoutInput) => Promise<void>;
  isLoading: boolean;
  defaultValues?: Partial<GenerateWorkoutInput>;
  dict: { // Dictionary for this component
    title?: string;
    description?: string;
    muscleGroupsLabel?: string;
    muscleGroupsPlaceholder?: string;
    availableTimeLabel?: string;
    availableTimePlaceholder?: string;
    equipmentLabel?: string;
    equipmentPlaceholder?: string;
    difficultyLabel?: string;
    selectDifficulty?: string;
    beginner?: string;
    intermediate?: string;
    advanced?: string;
    buttonGenerate?: string;
    buttonGenerating?: string;
    muscleGroupsOptions?: Record<string, string>;
    equipmentOptions?: Record<string, string>;
  };
  lang?: string;
}

type Mode = 'describe' | 'form';

export function WorkoutGeneratorForm({ onSubmit, isLoading, defaultValues, dict, lang }: WorkoutGeneratorFormProps) {
  // Options for labels (translation provided by dict)
  const muscleGroupOptions = dict.muscleGroupsOptions || { "full_body": "Full Body", "upper_body": "Upper Body", "lower_body": "Lower Body", "core": "Core" };
  const equipmentOptions = dict.equipmentOptions || { "none": "None / Bodyweight", "dumbbells": "Dumbbells", "resistance_bands": "Resistance Bands" };

  const keyFromLabel = (map: Record<string,string>, label?: string) => {
    if (!label) return undefined;
    const entry = Object.entries(map).find(([,v]) => v.toLowerCase() === String(label).toLowerCase());
    return entry?.[0];
  };
  const labelFromKey = (map: Record<string,string>, key?: string) => (key && map[key]) || String(key || '');

  const defaultMuscleKey = (defaultValues?.muscleGroups && (muscleGroupOptions[defaultValues.muscleGroups] ? defaultValues.muscleGroups : keyFromLabel(muscleGroupOptions, defaultValues.muscleGroups))) || 'full_body';
  const defaultEquipKey = (defaultValues?.equipment && (equipmentOptions[defaultValues.equipment] ? defaultValues.equipment : keyFromLabel(equipmentOptions, defaultValues.equipment))) || 'none';

  const form = useForm<WorkoutGeneratorFormValues>({
    resolver: zodResolver(workoutGeneratorSchema),
    defaultValues: {
      muscleGroups: defaultMuscleKey as any,
      availableTime: defaultValues?.availableTime || 30,
      equipment: defaultEquipKey as any,
      difficulty: defaultValues?.difficulty || 'beginner',
    },
  });

  // Convert form submission (which may hold keys or labels) into labels expected by generator
  const handleSubmit: SubmitHandler<WorkoutGeneratorFormValues> = async (data) => {
    const mg = muscleGroupOptions[data.muscleGroups] ? muscleGroupOptions[data.muscleGroups] : data.muscleGroups;
    const eq = equipmentOptions[data.equipment] ? equipmentOptions[data.equipment] : data.equipment;
    await onSubmit({ ...data, muscleGroups: mg, equipment: eq });
  };
  
  const [aiRequest, setAiRequest] = React.useState("");
  const [isParsing, setIsParsing] = React.useState(false);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [suggestionsPool, setSuggestionsPool] = React.useState<string[]>([]);
  const [visibleSuggestions, setVisibleSuggestions] = React.useState<string[]>([]);

  // Auto-fetch localized suggestions once when Describe mode is used or language changes.
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsSuggesting(true);
      try {
        const { suggestions: s } = await suggestWorkoutDescriptions({ language: lang || 'en', count: 40 });
        const arr = (s || []).slice();
        const shuffle = (a: string[]) => {
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        };
        shuffle(arr);
        if (!cancelled) {
          setSuggestionsPool(arr);
          setVisibleSuggestions(arr.slice(0, 5));
        }
      } finally {
        if (!cancelled) setIsSuggesting(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [lang]);

  const refreshVisibleSuggestions = React.useCallback(() => {
    if (!suggestionsPool.length) return;
    const copy = suggestionsPool.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setVisibleSuggestions(copy.slice(0, 5));
  }, [suggestionsPool]);
  const handleAIAutofill = async () => {
    if (isParsing) return;
    try {
      setIsParsing(true);
      if (!aiRequest.trim()) {
        const { example } = await suggestWorkoutDescription({ language: lang || 'en' });
        setAiRequest(example);
      } else {
        const parsed = await parseWorkoutRequest({ request: aiRequest, language: lang || 'en' });
        // Expect canonical keys from parser; fall back to key lookup by label
        const mgKey = (parsed as any).muscleGroupKey || keyFromLabel(muscleGroupOptions, (parsed as any).muscleGroups);
        const eqKey = (parsed as any).equipmentKey || keyFromLabel(equipmentOptions, (parsed as any).equipment);
        if (mgKey) form.setValue('muscleGroups', mgKey as any, { shouldValidate: true });
        if (typeof parsed.availableTime === 'number') form.setValue('availableTime', parsed.availableTime, { shouldValidate: true, shouldDirty: true });
        if (eqKey) form.setValue('equipment', eqKey as any, { shouldValidate: true });
        if (parsed.difficulty) form.setValue('difficulty', parsed.difficulty, { shouldValidate: true });
      }
    } finally {
      setIsParsing(false);
    }
  };

  const [mode, setMode] = React.useState<Mode>('form');
  const isBusy = isLoading || isParsing;
  const anyBusy = isLoading || isParsing || isSuggesting;

  const handlePrimaryGenerateClick = async () => {
    if (mode === 'form') {
      await form.handleSubmit(handleSubmit)();
    } else {
      if (!aiRequest.trim()) return;
      setIsParsing(true);
      try {
        const parsed = await parseWorkoutRequest({ request: aiRequest, language: lang || 'en' });
        const mgKey = (parsed as any).muscleGroupKey || keyFromLabel(muscleGroupOptions, (parsed as any).muscleGroups);
        const eqKey = (parsed as any).equipmentKey || keyFromLabel(equipmentOptions, (parsed as any).equipment);
        const payload: GenerateWorkoutInput = {
          muscleGroups: labelFromKey(muscleGroupOptions, mgKey),
          availableTime: parsed.availableTime,
          equipment: labelFromKey(equipmentOptions, eqKey),
          difficulty: parsed.difficulty,
        };
        await onSubmit(payload);
      } finally {
        setIsParsing(false);
      }
    }
  };
  

  return (
    <Card className="shadow-lg rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-[1px]">
      <div className="bg-card rounded-[inherit]">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl md:text-3xl font-headline tracking-tight">
            <Settings2 className="mr-2 h-6 w-6 text-primary" />
            {dict?.title || "Create Your Workout"}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {dict?.description || "Tell us your preferences, and we'll generate a personalized workout plan for you."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-6">
          <Form {...form}>
            {/* Mode switch */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="describe">{dict?.tabDescribe || 'Describe'}</TabsTrigger>
                <TabsTrigger value="form">{dict?.tabForm || 'Form'}</TabsTrigger>
              </TabsList>
              <TabsContent value="describe" className="space-y-4">
                <div className="space-y-2">
                  <FormLabel className="flex items-center"><Settings2 className="mr-2 h-4 w-4" />{dict?.describeInputLabel || 'Describe your workout'}</FormLabel>
                  <textarea
                    value={aiRequest}
                    onChange={(e) => setAiRequest(e.target.value)}
                    placeholder={dict?.describePlaceholder || 'e.g., 20‑min beginner HIIT, no equipment, focus legs'}
                    className="w-full min-h-24 resize-y rounded-xl border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
                  />
                  {/* Suggestions list (no buttons, non-interactive) */}
                  {isSuggesting && visibleSuggestions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{dict?.loadingSuggestions || 'Loading suggestions…'}</p>
                  ) : visibleSuggestions.length > 0 ? (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{dict?.suggestionsTitle || 'Suggestions'}</p>
                        <button
                          type="button"
                          onClick={refreshVisibleSuggestions}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-accent hover:text-accent-foreground transition-all duration-200 active:scale-[.98]"
                          aria-label="Refresh suggestions"
                          disabled={isSuggesting}
                        >
                          <RefreshCcw className="h-3 w-3" /> {dict?.refreshSuggestions || 'Refresh'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {visibleSuggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={async () => {
                              setAiRequest(s);
                              // Fill structured fields for convenience
                              setIsParsing(true);
                              try {
                                const parsed = await parseWorkoutRequest({ request: s, language: lang || 'en' });
                                const mgKey = (parsed as any).muscleGroupKey || keyFromLabel(muscleGroupOptions, (parsed as any).muscleGroups);
                                const eqKey = (parsed as any).equipmentKey || keyFromLabel(equipmentOptions, (parsed as any).equipment);
                                if (mgKey) form.setValue('muscleGroups', mgKey as any, { shouldValidate: true });
                                if (typeof parsed.availableTime === 'number') form.setValue('availableTime', parsed.availableTime, { shouldValidate: true, shouldDirty: true });
                                if (eqKey) form.setValue('equipment', eqKey as any, { shouldValidate: true });
                                if (parsed.difficulty) form.setValue('difficulty', parsed.difficulty, { shouldValidate: true });
                              } finally { setIsParsing(false); }
                            }}
                            className="text-left text-xs px-2 py-1 rounded-md border hover:bg-accent hover:text-accent-foreground transition-all duration-200 active:scale-[.98]"
                            aria-label={`Suggestion ${i+1}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="hidden md:flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={handleAIAutofill} disabled={isParsing} className="transition-all duration-200 hover:shadow-md active:scale-[.98]">
                      {isParsing ? (
                        dict?.aiAutofilling || 'Autofilling…'
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="h-4 w-4" />
                          <span>{dict?.aiAutofill || 'Fill'}</span>
                        </span>
                      )}
                    </Button>
                    <Button type="button" onClick={handlePrimaryGenerateClick} disabled={anyBusy} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-[.98] focus-visible:ring-2 focus-visible:ring-ring">
                      {isParsing ? 'Generating…' : (dict?.buttonGenerate || 'Generate Workout')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="form">
                <form id="generator-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="muscleGroups"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Users className="mr-2 h-4 w-4" />{dict?.muscleGroupsLabel || "Muscle Groups"}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-3 py-2.5">
                              <SelectValue placeholder={dict?.muscleGroupsPlaceholder || "Select a muscle group"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(muscleGroupOptions).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availableTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Clock3 className="mr-2 h-4 w-4" />{dict?.availableTimeLabel || "Available Time (minutes)"}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={dict?.availableTimePlaceholder || "e.g., 30"} {...field} className="px-3 py-2.5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Dumbbell className="mr-2 h-4 w-4" />{dict?.equipmentLabel || "Available Equipment"}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-3 py-2.5">
                              <SelectValue placeholder={dict?.equipmentPlaceholder || "Select equipment"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(equipmentOptions).map(([key, value]) => (
                              <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Zap className="mr-2 h-4 w-4" />{dict?.difficultyLabel || "Difficulty Level"}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-3 py-2.5">
                              <SelectValue placeholder={dict?.selectDifficulty || "Select difficulty"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">{dict?.beginner || "Beginner"}</SelectItem>
                            <SelectItem value="intermediate">{dict?.intermediate || "Intermediate"}</SelectItem>
                            <SelectItem value="advanced">{dict?.advanced || "Advanced"}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Desktop/Tablet submit button */}
                  <div className="hidden md:block">
                    <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-[.98] focus-visible:ring-2 focus-visible:ring-ring">
                      {isLoading ? (dict?.buttonGenerating || "Generating...") : (dict?.buttonGenerate || "Generate Workout")}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </Form>
        </CardContent>
        {/* Mobile sticky submit bar */}
        <div className="md:hidden fixed bottom-20 left-0 right-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          {mode === 'form' ? (
            <Button type="submit" form="generator-form" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-[.98]">
              {isLoading ? (dict?.buttonGenerating || "Generating...") : (dict?.buttonGenerate || "Generate Workout")}
            </Button>
          ) : (
            <Button type="button" onClick={handlePrimaryGenerateClick} disabled={isBusy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-[.98]">
              {isBusy ? (dict?.buttonGenerating || "Generating...") : (dict?.buttonGenerate || "Generate Workout")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
