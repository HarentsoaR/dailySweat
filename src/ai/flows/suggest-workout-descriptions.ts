'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestWorkoutDescriptionsInputSchema = z.object({
  language: z.string().optional().default('en'),
  count: z.number().optional().default(6),
});
export type SuggestWorkoutDescriptionsInput = z.infer<typeof SuggestWorkoutDescriptionsInputSchema>;

const SuggestWorkoutDescriptionsOutputSchema = z.object({
  suggestions: z.array(z.string()),
});
export type SuggestWorkoutDescriptionsOutput = z.infer<typeof SuggestWorkoutDescriptionsOutputSchema>;

export async function suggestWorkoutDescriptions(input: SuggestWorkoutDescriptionsInput): Promise<SuggestWorkoutDescriptionsOutput> {
  return suggestWorkoutDescriptionsFlow(input);
}

const suggestManyPrompt = ai.definePrompt({
  name: 'suggestWorkoutDescriptionsPrompt',
  input: { schema: SuggestWorkoutDescriptionsInputSchema },
  output: { schema: SuggestWorkoutDescriptionsOutputSchema },
  prompt: `Generate {{count}} distinct, concise example texts (single sentence each) a user could type to describe a workout they want. Use the target language.

Language: {{{language}}}
Rules:
- Include duration, level, equipment (or none), and focus in each example.
- Keep each example under 120 characters.
- Return JSON: {"suggestions":["...","...", ...]}. Do not add any other text.
Examples (English): "20-min beginner HIIT, no equipment, focus legs"; "30-min intermediate full-body with dumbbells";
`,
});

const suggestWorkoutDescriptionsFlow = ai.defineFlow(
  {
    name: 'suggestWorkoutDescriptionsFlow',
    inputSchema: SuggestWorkoutDescriptionsInputSchema,
    outputSchema: SuggestWorkoutDescriptionsOutputSchema,
  },
  async (input) => {
    const { output } = await suggestManyPrompt(input);
    return output!;
  }
);

