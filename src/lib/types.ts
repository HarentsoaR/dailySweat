
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

// Structural type for the dictionary, based on en.json
export interface DictionaryType {
  metadata: {
    title: string;
    description: string;
  };
  header?: {
    title?: string;
  };
  footer?: {
    tagline?: string;
  };
  page?: {
    loadingText?: string;
    tabs?: {
      workout?: string;
      history?: string;
    };
    workoutGenerator?: {
      title?: string;
      description?: string;
      muscleGroupsLabel?: string;
      muscleGroupsPlaceholder?: string;
      availableTimeLabel?: string;
      availableTimePlaceholder?: string;
      equipmentLabel?: string;
      equipmentPlaceholder?: string;
      difficultyLabel?: string;
      selectDifficulty?: string;
      beginner?: string;
      intermediate?: string;
      advanced?: string;
      buttonGenerate?: string;
      buttonGenerating?: string;
    };
    workoutDisplay?: {
      title?: string;
      emptyState?: string;
      startWorkoutButton?: string;
      noExercises?: string;
    };
    exerciseCard?: {
      setsLabel?: string;
      repsLabel?: string;
      restLabel?: string;
      startRestButton?: string;
      exerciseInfoTooltip?: string;
    };
    activeWorkoutDisplay?: {
      title?: string;
      exerciseProgress?: string;
      startRestButton?: string;
      previousButton?: string;
      nextButton?: string;
      finishButton?: string;
      endWorkoutEarlyButton?: string;
      noCurrentExercise?: string;
    };
    difficultyFeedback?: {
      title?: string;
      description?: string;
      tooEasy?: string;
      justRight?: string;
      tooHard?: string;
      adjusting?: string;
    };
    workoutHistory?: {
      title?: string;
      description?: string;
      emptyState?: string;
      generatedOn?: string;
      feedbackGiven?: string;
      viewButton?: string;
      deleteButton?: string;
      clearAllButton?: string;
      loading?: string;
    };
    restTimer?: {
      title?: string;
      description?: string;
      pauseButtonSR?: string;
      playButtonSR?: string;
      resetButtonSR?: string;
    };
    chatbot?: {
      dialogTitle?: string;
      dialogDescription?: string;
      inputPlaceholder?: string;
      initialMessage?: string;
      errorMessage?: string;
      sendButtonSR?: string;
    };
    toasts?: {
      workoutGeneratedTitle?: string;
      workoutGeneratedDescription?: string;
      generationFailedTitle?: string;
      generationFailedDescription?: string;
      workoutAdjustedTitle?: string;
      workoutAdjustedDescription?: string;
      adjustmentFailedTitle?: string;
      adjustmentFailedDescription?: string;
      restOverTitle?: string;
      restOverDescription?: string;
      workoutLoadedTitle?: string;
      workoutLoadedDescription?: string;
      workoutStartedTitle?: string;
      workoutStartedDescription?: string;
      workoutCompleteTitle?: string;
      workoutCompleteDescription?: string;
      workoutEndedTitle?: string;
      workoutEndedDescription?: string;
    };
    errors?: {
      alertTitle?: string;
      invalidAIPlan?: string;
      emptyAIPlan?: string;
      noWorkoutToAdjust?: string;
      invalidAdjustedAIPlan?: string;
      emptyAdjustedAIPlan?: string;
      failedToGenerate?: string;
      failedToAdjust?: string;
      cannotStartEmptyWorkout?: string;
    };
  };
}
