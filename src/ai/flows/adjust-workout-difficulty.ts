
'use server';

/**
 * @fileOverview Adjusts the workout plan difficulty based on user feedback.
 *
 * - adjustWorkoutDifficulty - A function to adjust the workout difficulty.
 * - AdjustWorkoutDifficultyInput - The input type for the adjustWorkoutDifficulty function.
 * - AdjustWorkoutDifficultyOutput - The return type for the adjustWorkoutDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const AdjustWorkoutDifficultyInputSchema = z.object({
  workoutPlan: z.string().describe('The current workout plan in JSON string format.'),
  feedback: z
    .string()
    .describe(
      'User feedback on the workout difficulty (e.g., too easy, too hard, just right).',    ),
  language: z
    .string()
    .describe('The target language for the adjusted workout plan content (e.g., "en", "fr").'),
});
export type AdjustWorkoutDifficultyInput = z.infer<
  typeof AdjustWorkoutDifficultyInputSchema
>;

const AdjustWorkoutDifficultyOutputSchema = z.object({
  adjustedWorkoutPlan: z
    .string()
    .describe('The adjusted core workout (name, description, exercises) in JSON string format, with content in the specified language.'),
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

  The user has provided the following workout plan as a JSON string:
  {{{workoutPlan}}}

  The user has provided the following feedback on the workout difficulty:
  {{{feedback}}}

  The target language for the adjusted plan is: {{{language}}}

  Based on this feedback, adjust the workout plan.
  Generate all textual content for the adjusted workout plan (including the plan name, plan description, all exercise names, and all exercise descriptions) in the specified language: {{{language}}}.

  Return strictly a JSON object string representing the core adjusted workout. The JSON object must conform to the following structure:
  {
    "name": "string (optional, the adjusted name of the workout, e.g., 'Intermediate Upper Body Focus' - IN SPECIFIED LANGUAGE)",
    "description": "string (optional, a brief description of the adjusted workout focus - IN SPECIFIED LANGUAGE)",
    "exercises": [
      {
        "name": "string (e.g., 'Bench Press' - IN SPECIFIED LANGUAGE)",
        "sets": "string or number (e.g., 4 or '4')",
        "reps": "string (e.g., '8-10')",
        "rest": "number (in seconds, e.g., 90)",
        "description": "string (optional, e.g., 'Ensure full range of motion' - IN SPECIFIED LANGUAGE)"
      }
      // ... more adjusted exercises
    ]
  }
  The 'exercises' array should contain the complete list of adjusted exercises and must not be empty.
  Ensure the output is only the JSON string, with no other text before or after it. Do not include any fields from the original plan unless they are part of this specified structure (name, description, exercises).
  All translatable text fields (name, description, exercises.name, exercises.description) MUST be in the language specified by the 'language' input parameter.`,
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

