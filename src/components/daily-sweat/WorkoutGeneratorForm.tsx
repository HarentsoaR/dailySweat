
"use client";

import type { GenerateWorkoutInput } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {Clock3, Settings2, Users, Zap } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

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
  };
}

export function WorkoutGeneratorForm({ onSubmit, isLoading, defaultValues, dict }: WorkoutGeneratorFormProps) {
  const form = useForm<WorkoutGeneratorFormValues>({
    resolver: zodResolver(workoutGeneratorSchema),
    defaultValues: {
      muscleGroups: defaultValues?.muscleGroups || 'Full Body',
      availableTime: defaultValues?.availableTime || 30,
      equipment: defaultValues?.equipment || 'Bodyweight',
      difficulty: defaultValues?.difficulty || 'beginner',
    },
  });

  const handleSubmit: SubmitHandler<WorkoutGeneratorFormValues> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <Settings2 className="mr-2 h-6 w-6 text-primary" />
          {dict?.title || "Create Your Workout"}
        </CardTitle>
        <CardDescription>
          {dict?.description || "Tell us your preferences, and we'll generate a personalized workout plan for you."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="muscleGroups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Users className="mr-2 h-4 w-4" />{dict?.muscleGroupsLabel || "Muscle Groups"}</FormLabel>
                  <FormControl>
                    <Input placeholder={dict?.muscleGroupsPlaceholder || "e.g., Legs, Core, Arms or Full Body"} {...field} />
                  </FormControl>
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
                    <Input type="number" placeholder={dict?.availableTimePlaceholder || "e.g., 30"} {...field} />
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
                  <FormLabel className="flex items-center">{dict?.equipmentLabel || "Available Equipment"}</FormLabel>
                  <FormControl>
                    <Input placeholder={dict?.equipmentPlaceholder || "e.g., Dumbbells, Resistance Bands, Bodyweight"} {...field} />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? (dict?.buttonGenerating || "Generating...") : (dict?.buttonGenerate || "Generate Workout")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

