'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParseWorkoutRequestInputSchema = z.object({
  request: z.string().describe('Natural language description of the desired workout'),
  language: z.string().optional().default('en'),
});
export type ParseWorkoutRequestInput = z.infer<typeof ParseWorkoutRequestInputSchema>;

const ParseWorkoutRequestOutputSchema = z.object({
  // Canonical keys for stable UI binding regardless of language
  muscleGroupKey: z.enum(['full_body','upper_body','lower_body','core']),
  equipmentKey: z.enum(['none','dumbbells','resistance_bands']),
  availableTime: z.number(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});
export type ParseWorkoutRequestOutput = z.infer<typeof ParseWorkoutRequestOutputSchema>;

export async function parseWorkoutRequest(input: ParseWorkoutRequestInput): Promise<ParseWorkoutRequestOutput> {
  return parseWorkoutRequestFlow(input);
}

const parsePrompt = ai.definePrompt({
  name: 'parseWorkoutRequestPrompt',
  input: { schema: ParseWorkoutRequestInputSchema },
  output: { schema: ParseWorkoutRequestOutputSchema },
  prompt: `You parse a user's natural language workout description into structured parameters.

User request (in any language): {{{request}}}
Target language for output values: {{{language}}}

Return a JSON object with EXACT fields using canonical keys so the UI can remain language-agnostic:
- muscleGroupKey: one of 'full_body' | 'upper_body' | 'lower_body' | 'core'.
- equipmentKey: one of 'none' | 'dumbbells' | 'resistance_bands'.
- availableTime: integer minutes between 5 and 180. If a range is given, choose a reasonable value.
- difficulty: one of 'beginner' | 'intermediate' | 'advanced'.

Examples:
"20 minute HIIT no equipment legs" -> {"muscleGroupKey":"lower_body","equipmentKey":"none","availableTime":20,"difficulty":"beginner"}

If anything is missing, infer sensible defaults: 30 minutes, 'none', 'beginner', 'full_body'. Output strictly the JSON with these fields and no extra text.
`,
});

const parseWorkoutRequestFlow = ai.defineFlow(
  {
    name: 'parseWorkoutRequestFlow',
    inputSchema: ParseWorkoutRequestInputSchema,
    outputSchema: ParseWorkoutRequestOutputSchema,
  },
  async (input) => {
    const { output } = await parsePrompt(input);
    return output!;
  }
);
