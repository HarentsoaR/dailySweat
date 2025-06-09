import type { GenerateWorkoutInput as AIWorkoutInput } from '@/ai/flows/generate-workout';

export interface Exercise {
  name: string;
  sets: number | string;
  reps: string;
  rest: number; // in seconds
  description?: string;
}

export interface WorkoutPlan {
  id: string; // unique id, e.g., timestamp string
  name: string;
  // Parameters used to generate this plan
  muscleGroups: string;
  availableTime: number;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  // Actual exercises
  exercises: Exercise[];
  generatedAt: string; // ISO date string
  // For adjusted plans, link to original
  originalPlanId?: string; 
  feedbackGiven?: string; // e.g., "too easy", "too hard"
}

// What AI is expected to return in its 'workoutPlan' string (parsed)
export interface AIParsedWorkoutOutput {
  name?: string;
  description?: string; // General description of the workout
  exercises: Exercise[];
}

export type GenerateWorkoutInput = AIWorkoutInput;

export type DifficultyFeedbackOption = "too easy" | "just right" | "too hard";
