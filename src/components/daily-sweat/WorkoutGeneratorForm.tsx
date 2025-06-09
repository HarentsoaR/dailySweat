
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
    title: string;
    description: string;
    muscleGroupsLabel: string;
    muscleGroupsPlaceholder: string;
    availableTimeLabel: string;
    availableTimePlaceholder: string;
    equipmentLabel: string;
    equipmentPlaceholder: string;
    difficultyLabel: string;
    selectDifficulty: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    buttonGenerate: string;
    buttonGenerating: string;
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
          {dict.title}
        </CardTitle>
        <CardDescription>
          {dict.description}
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
                  <FormLabel className="flex items-center"><Users className="mr-2 h-4 w-4" />{dict.muscleGroupsLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={dict.muscleGroupsPlaceholder} {...field} />
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
                  <FormLabel className="flex items-center"><Clock3 className="mr-2 h-4 w-4" />{dict.availableTimeLabel}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={dict.availableTimePlaceholder} {...field} />
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
                  <FormLabel className="flex items-center">{dict.equipmentLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={dict.equipmentPlaceholder} {...field} />
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
                  <FormLabel className="flex items-center"><Zap className="mr-2 h-4 w-4" />{dict.difficultyLabel}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={dict.selectDifficulty} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">{dict.beginner}</SelectItem>
                      <SelectItem value="intermediate">{dict.intermediate}</SelectItem>
                      <SelectItem value="advanced">{dict.advanced}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? dict.buttonGenerating : dict.buttonGenerate}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
