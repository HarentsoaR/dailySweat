'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestWorkoutDescriptionInputSchema = z.object({
  language: z.string().optional().default('en'),
});
export type SuggestWorkoutDescriptionInput = z.infer<typeof SuggestWorkoutDescriptionInputSchema>;

const SuggestWorkoutDescriptionOutputSchema = z.object({
  example: z.string(),
});
export type SuggestWorkoutDescriptionOutput = z.infer<typeof SuggestWorkoutDescriptionOutputSchema>;

export async function suggestWorkoutDescription(input: SuggestWorkoutDescriptionInput): Promise<SuggestWorkoutDescriptionOutput> {
  return suggestWorkoutDescriptionFlow(input);
}

const suggestPrompt = ai.definePrompt({
  name: 'suggestWorkoutDescriptionPrompt',
  input: { schema: SuggestWorkoutDescriptionInputSchema },
  output: { schema: SuggestWorkoutDescriptionOutputSchema },
  prompt: `Generate one concise example text (single sentence) a user could type to describe a workout they want. Use the target language.

Language: {{{language}}}

The example should include: duration, level, equipment, and focus. Keep it under 120 characters. Output JSON: {"example":"..."} with no extra text.
Examples (English): "20-min beginner HIIT, no equipment, focus legs"; "30-min intermediate full-body with dumbbells".
`,
});

const suggestWorkoutDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestWorkoutDescriptionFlow',
    inputSchema: SuggestWorkoutDescriptionInputSchema,
    outputSchema: SuggestWorkoutDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await suggestPrompt(input);
    return output!;
  }
);

