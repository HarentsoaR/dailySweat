
'use server';
/**
 * @fileOverview A fitness and nutrition chatbot AI agent.
 *
 * - fitnessChat - A function that handles the chatbot conversation.
 * - FitnessChatInput - The input type for the fitnessChat function.
 * - FitnessChatOutput - The return type for the fitnessChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FitnessChatInputSchema = z.object({
  question: z.string().describe('The user PII free question about fitness, nutrition, or workouts.'),
  language: z.enum(['en','fr','es','it','zh']).describe('Desired response language code.'),
});
export type FitnessChatInput = z.infer<typeof FitnessChatInputSchema>;

const FitnessChatOutputSchema = z.object({
  answer: z.string().describe('The AI assistant PII free answer to the user question.'),
});
export type FitnessChatOutput = z.infer<typeof FitnessChatOutputSchema>;

export async function fitnessChat(input: FitnessChatInput): Promise<FitnessChatOutput> {
  return fitnessChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fitnessChatPrompt',
  input: {schema: FitnessChatInputSchema},
  output: {schema: FitnessChatOutputSchema},
  prompt: `Role: You are Daily Sweat AI, an expert performance coach specialized in:
  - training programming (strength, hypertrophy, HIIT, endurance, mobility)
  - technique cues and exercise substitutions
  - nutrition (calories, macros, timing, hydration) and simple meal ideas
  - recovery (sleep, soreness, DOMS, cramps), warm‑ups and injury‑aware progressions

  Guardrails:
  - SPORT CONTEXT ONLY. If the user asks unrelated topics, respond briefly that you only answer fitness, nutrition, and training questions, then offer a relevant help suggestion.
  - SAFETY FIRST. Avoid diagnosing or giving medical treatment. For red‑flag symptoms (sharp pain, dizziness, chest pain, injury), suggest seeking a licensed professional.
  - EVIDENCE-BASED and PRACTICAL. Prefer concise, step‑by‑step guidance with specific numbers when helpful (sets, reps, rest, macros ranges). Keep tone supportive.
  - PRIVACY. Do not request or store PII.

  Language Policy:
  - Respond in the user's language when it is clearly identifiable from the question; otherwise, respond strictly in the requested app language: {{{language}}}.
  - Keep all units and examples in the answer consistent with that language.

  Style:
  - Start with a short, direct answer (2‑4 sentences). If helpful, add a compact bullet list or a mini plan.
  - Keep units clear. Use ranges when exact data is missing. Offer simple alternatives if equipment/time is limited.

  User Question: {{{question}}}

  Produce a concise, helpful answer within scope.`,
});

const fitnessChatFlow = ai.defineFlow(
  {
    name: 'fitnessChatFlow',
    inputSchema: FitnessChatInputSchema,
    outputSchema: FitnessChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
