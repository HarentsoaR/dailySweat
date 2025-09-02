'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WeeklyInsightsInputSchema = z.object({
  historyJson: z.string().describe('JSON string of WorkoutPlan[] as stored in history'),
  language: z.string().optional().default('en'),
});
export type WeeklyInsightsInput = z.infer<typeof WeeklyInsightsInputSchema>;

const WeeklyInsightsOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  suggestions: z.array(z.string()),
  nextSuggestedParams: z.object({
    muscleGroups: z.string(),
    availableTime: z.number(),
    equipment: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  }).optional(),
});
export type WeeklyInsightsOutput = z.infer<typeof WeeklyInsightsOutputSchema>;

export async function weeklyInsights(input: WeeklyInsightsInput): Promise<WeeklyInsightsOutput> {
  return weeklyInsightsFlow(input);
}

const insightsPrompt = ai.definePrompt({
  name: 'weeklyInsightsPrompt',
  input: { schema: WeeklyInsightsInputSchema },
  output: { schema: WeeklyInsightsOutputSchema },
  prompt: `You are a fitness coach generating weekly insights from the user's workout history.

History JSON (array of plans with name, difficulty, exercises, generatedAt): {{{historyJson}}}
Language: {{{language}}}

Provide:
- title: a short headline in the selected language (e.g., 'Weekly Progress Summary').
- summary: 3-5 sentences highlighting volume, variety, and focus areas; mention streak if applicable.
- suggestions: 3-5 concise, actionable next steps (e.g., 'Add one mobility session', 'Increase sets for legs').
- nextSuggestedParams (optional): a sensible next plan suggestion (muscleGroups, availableTime, equipment, difficulty) to prefill the generator.

Keep advice safe and motivational. Output strictly as JSON.
`,
});

const weeklyInsightsFlow = ai.defineFlow(
  {
    name: 'weeklyInsightsFlow',
    inputSchema: WeeklyInsightsInputSchema,
    outputSchema: WeeklyInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await insightsPrompt(input);
    return output!;
  }
);

