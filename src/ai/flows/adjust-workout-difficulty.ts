'use server';

/**
 * @fileOverview Adjusts the workout plan difficulty based on user feedback.
 *
 * - adjustWorkoutDifficulty - A function to adjust the workout difficulty.
 * - AdjustWorkoutDifficultyInput - The input type for the adjustWorkoutDifficulty function.
 * - AdjustWorkoutDifficultyOutput - The return type for the adjustWorkoutDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustWorkoutDifficultyInputSchema = z.object({
  workoutPlan: z.string().describe('The workout plan in JSON format.'),
  feedback: z
    .string()
    .describe(
      'User feedback on the workout difficulty (e.g., too easy, too hard, just right).'n    ),
});
export type AdjustWorkoutDifficultyInput = z.infer<
  typeof AdjustWorkoutDifficultyInputSchema
>;

const AdjustWorkoutDifficultyOutputSchema = z.object({
  adjustedWorkoutPlan: z
    .string()
    .describe('The adjusted workout plan in JSON format.'),
});
export type AdjustWorkoutDifficultyOutput = z.infer<
  typeof AdjustWorkoutDifficultyOutputSchema
>;

export async function adjustWorkoutDifficulty(
  input: AdjustWorkoutDifficultyInput
): Promise<AdjustWorkoutDifficultyOutput> {
  return adjustWorkoutDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustWorkoutDifficultyPrompt',
  input: {schema: AdjustWorkoutDifficultyInputSchema},
  output: {schema: AdjustWorkoutDifficultyOutputSchema},
  prompt: `You are a personal trainer AI, who adjusts workout plans based on user feedback.

  The user has provided the following workout plan:
  {{workoutPlan}}

  The user has provided the following feedback on the workout difficulty:
  {{feedback}}

  Based on this feedback, adjust the workout plan to be more appropriate for the user.
  Ensure that the adjusted workout plan is valid JSON, and only return the JSON.
  Do not return any other information.`,
});

const adjustWorkoutDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustWorkoutDifficultyFlow',
    inputSchema: AdjustWorkoutDifficultyInputSchema,
    outputSchema: AdjustWorkoutDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
