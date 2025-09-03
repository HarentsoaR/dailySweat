'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { runWithRetries } from '@/ai/utils';

const TranslateWorkoutPlanInputSchema = z.object({
  workoutPlan: z.string().describe('JSON string of the workout plan with fields: name, description, exercises[].name, exercises[].description'),
  language: z.string().default('en').describe('Target language code (e.g., en, fr, es, it, zh)'),
});
export type TranslateWorkoutPlanInput = z.infer<typeof TranslateWorkoutPlanInputSchema>;

const TranslateWorkoutPlanOutputSchema = z.object({
  translatedWorkoutPlan: z.string().describe('JSON string of the same workout plan with user-facing text translated to target language'),
});
export type TranslateWorkoutPlanOutput = z.infer<typeof TranslateWorkoutPlanOutputSchema>;

export async function translateWorkoutPlan(input: TranslateWorkoutPlanInput): Promise<TranslateWorkoutPlanOutput> {
  return translateWorkoutPlanFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translateWorkoutPlanPrompt',
  input: { schema: TranslateWorkoutPlanInputSchema },
  output: { schema: TranslateWorkoutPlanOutputSchema },
  prompt: `You will receive a workout plan as a JSON string. Translate ONLY the user-facing text into the Target Language, keeping the JSON structure and non-text values (numbers) unchanged.

Target Language: {{{language}}}

User-facing text fields to translate:
- name (root)
- description (root)
- exercises[].name
- exercises[].description (if present)

STRICT RULES:
- Preserve the JSON structure and keys exactly.
- Do not modify numbers (sets, reps, rest, duration) or their types.
- Return ONLY the translated JSON string with no extra text.

Workout JSON:
{{{workoutPlan}}}
`,
});

const translateWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'translateWorkoutPlanFlow',
    inputSchema: TranslateWorkoutPlanInputSchema,
    outputSchema: TranslateWorkoutPlanOutputSchema,
  },
  async (input) => {
    const { output } = await runWithRetries(() => translatePrompt(input));
    return output!;
  }
);
