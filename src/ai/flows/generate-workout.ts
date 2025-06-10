
// src/ai/flows/generate-workout.ts
'use server';
/**
 * @fileOverview A personalized workout plan generator AI agent.
 *
 * - generateWorkout - A function that handles the workout plan generation process.
 * - GenerateWorkoutInput - The input type for the generateWorkout function.
 * - GenerateWorkoutOutput - The return type for the generateWorkout function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const GenerateWorkoutInputSchema = z.object({
  muscleGroups: z
    .string()
    .describe("The muscle groups to focus on in the workout plan (e.g., 'legs, core, arms')."),
  availableTime: z
    .number()
    .describe('The available time for the workout in minutes.'),
  equipment: z
    .string()
    .describe("The available equipment for the workout (e.g., 'dumbbells, resistance bands, bodyweight')."),
  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The difficulty level of the workout plan.'),
});
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutInputSchema>;

const GenerateWorkoutOutputSchema = z.object({
  workoutPlan: z
    .string()
    .describe("A personalized daily workout plan based on the user's preferences, as a JSON string."),
});
export type GenerateWorkoutOutput = z.infer<typeof GenerateWorkoutOutputSchema>;

export async function generateWorkout(input: GenerateWorkoutInput): Promise<GenerateWorkoutOutput> {
  return generateWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPrompt',
  input: {schema: GenerateWorkoutInputSchema},
  output: {schema: GenerateWorkoutOutputSchema},
  prompt: `You are a personal trainer who creates personalized daily workout plans based on user preferences.

  Create a workout plan based on the following preferences:

  Muscle Groups: {{{muscleGroups}}}
  Available Time: {{{availableTime}}} minutes
  Equipment: {{{equipment}}}
  Difficulty: {{{difficulty}}}

  Return the workout plan strictly as a JSON object string. The JSON object must conform to the following structure:
  {
    "name": "string (optional, e.g., 'Beginner Full Body Blast')",
    "description": "string (optional, a brief description of the workout focus)",
    "exercises": [
      {
        "name": "string (e.g., 'Push-ups')",
        "sets": "string or number (e.g., 3 or '3')",
        "reps": "string (e.g., '10-12' or 'As many as possible')",
        "rest": "number (in seconds, e.g., 60)",
        "description": "string (optional, e.g., 'Focus on form')",
        "duration": "number (optional, in seconds, e.g., 60 for a plank. Omit if exercise is purely rep-based)"
      }
      // ... more exercises
    ]
  }
  Ensure the output is only the JSON string, with no other text before or after it. The 'exercises' array must not be empty.
  If an exercise is time-based (e.g., plank, wall sit, timed run), include a 'duration' field in seconds. For rep-based exercises, 'duration' can be omitted.
  `,
});

const generateWorkoutFlow = ai.defineFlow(
  {
    name: 'generateWorkoutFlow',
    inputSchema: GenerateWorkoutInputSchema,
    outputSchema: GenerateWorkoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
