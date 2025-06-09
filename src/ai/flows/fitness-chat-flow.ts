
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
  prompt: `You are a friendly and knowledgeable fitness and nutrition assistant called Daily Sweat AI.
  Your goal is to provide helpful, accurate, and encouraging PII free information to users about their fitness-related queries.
  Do not ask for or store any Personally Identifiable Information (PII).
  Answer the following user question:

  User Question: {{{question}}}

  Provide a concise and helpful answer. If the question is outside the scope of fitness, nutrition, workouts, or general well-being, politely state that you can only answer fitness-related questions.
  Do not invent dangerous or unproven advice. Prioritize safety and evidence-based information.
  `,
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
