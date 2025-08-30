// No direct import from AI flow needed here for GenerateWorkoutInput if client page defines its own
// However, ensure its structure (excluding language) is compatible with what WorkoutGeneratorForm provides.

export interface Exercise {
  name: string;
  sets: number | string;
  reps: string;
  rest: number; // in seconds
  description?: string;
  duration?: number; // Optional: duration of the exercise itself in seconds (for timed exercises)
}

export interface WorkoutPlan {
  id: string; // unique id, e.g., timestamp string
  name: string;
  description?: string; // General description, potentially from AI
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

// This type represents the data structure used by WorkoutGeneratorForm
// and what DailySweatClientPage's currentWorkoutParams holds.
export interface GenerateWorkoutInput {
  muscleGroups: string;
  availableTime: number;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}


// What AI is expected to return in its 'workoutPlan' string (parsed) for BOTH generation and adjustment
export interface AIParsedWorkoutOutput {
  name?: string;
  description?: string; // General description of the workout
  exercises: Exercise[];
}

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
    workoutModal?: {
      activeWorkoutModalTitle?: string;
      workoutCompleteTitle?: string;
      workoutCompleteCongrats?: string;
      kcalBurnedPlaceholder?: string;
      closeButton?: string;
      exerciseTimerTitle?: string;
      pauseExerciseButton?: string;
      resumeExerciseButton?: string;
      exerciseLabel?: string;
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
      muscleGroupsOptions?: Record<string, string>;
      equipmentOptions?: Record<string, string>;
    };
    workoutDisplay?: {
      title?: string;
      emptyState?: string;
      startWorkoutButton?: string;
      noExercises?: string;
      includesExercises?: string; // New
    };
    exerciseCard?: {
      setsLabel?: string;
      repsLabel?: string;
      restLabel?: string;
      startRestButton?: string;
      exerciseInfoTooltip?: string;
      durationLabel?: string;
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
      exerciseLabel?: string;
      setsLabel?: string;
      repsLabel?: string;
      restLabel?: string;
      durationLabel?: string;
      pauseExercise?: string;
      resumeExercise?: string;
      exerciseCompleteMessage?: string;
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
      exerciseTimeUpTitle?: string;
      exerciseTimeUpDescription?: string;
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