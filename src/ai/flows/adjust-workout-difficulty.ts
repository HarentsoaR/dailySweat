
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
      'User feedback on the workout difficulty (e.g., too easy, too hard, just right).',
    ),
  language: z
    .string()
    .describe('The target language for the workout plan content (e.g., "en", "fr").'),
});
export type AdjustWorkoutDifficultyInput = z.infer<
  typeof AdjustWorkoutDifficultyInputSchema
>;

const AdjustWorkoutDifficultyOutputSchema = z.object({
  adjustedWorkoutPlan: z
    .string()
    .describe('The adjusted core workout (name, description, exercises) in JSON string format.'),
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

  Target Language for the output: {{{language}}}

  Based on this feedback, adjust the workout plan.
  
  IMPORTANT: Generate all user-facing text (the 'name' and 'description' of the workout, and the 'name' and 'description' of each exercise) in the specified Target Language. The JSON structure and keys must remain in English.

  Return strictly a JSON object string representing the core adjusted workout. The JSON object must conform to the following structure:
  {
    "name": "string (the adjusted name of the workout, e.g., 'Intermediate Upper Body Focus')",
    "description": "string (a brief description of the adjusted workout focus)",
    "exercises": [
      {
        "name": "string (e.g., 'Bench Press')",
        "sets": "string or number (e.g., 4 or '4')",
        "reps": "string (e.g., '8-10')",
        "rest": "number (in seconds, e.g., 90)",
        "description": "string (optional, e.g., 'Ensure full range of motion')",
        "duration": "number (optional, in seconds, e.g., 60 for a plank. Omit if exercise is purely rep-based. If the original exercise had a duration, try to maintain or adjust it logically.)"
      }
      // ... more adjusted exercises
    ]
  }
  The 'exercises' array should contain the complete list of adjusted exercises and must not be empty.
  Ensure the output is only the JSON string, with no other text before or after it. Do not include any fields from the original plan unless they are part of this specified structure (name, description, exercises).
  If an exercise is time-based (e.g., plank, wall sit, timed run), include a 'duration' field in seconds. For rep-based exercises, 'duration' can be omitted. If adjusting an exercise that originally had a duration, try to maintain or adjust it logically based on the feedback.
  `,
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
