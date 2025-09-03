"use client";

import type { WorkoutPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Flame, Leaf, Zap, Info, CalendarDays, Clock, Dumbbell, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ExerciseCardDict {
  setsLabel?: string;
  repsLabel?: string;
  restLabel?: string;
  startRestButton?: string;
  exerciseInfoTooltip?: string;
}

interface WorkoutDisplayProps {
  workoutPlan: WorkoutPlan | null;
  onStartWorkout: () => void;
  isWorkoutActive: boolean; // Still useful for conditional rendering of the start button
  dict: { 
    title?: string;
    emptyState?: string;
    startWorkoutButton?: string;
    noExercises?: string;
    includesExercises?: string;
  };
  exerciseCardDict: ExerciseCardDict; // Still passed, but not used directly in this component anymore
  onRegenerate?: (hint: string) => void;
  isRegenerating?: boolean;
}

const DifficultyIcon = ({ difficulty }: { difficulty: WorkoutPlan['difficulty'] }) => {
  switch (difficulty) {
    case 'beginner':
      return <Leaf className="h-5 w-5 text-green-500" />;
    case 'intermediate':
      return <Zap className="h-5 w-5 text-yellow-500" />;
    case 'advanced':
      return <Flame className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

export function WorkoutDisplay({ workoutPlan, onStartWorkout, isWorkoutActive, dict, onRegenerate, isRegenerating }: WorkoutDisplayProps) {
  if (!workoutPlan) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline tracking-tight">
            <ClipboardList className="mr-2 h-6 w-6 text-primary" />
            {dict?.title || "Your Workout Plan"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {dict?.emptyState || "Generate a workout plan using the form to see it here."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const planDescription = workoutPlan.description;
  const exerciseSummary = workoutPlan.exercises.map(ex => ex.name).join(', ');

  return (
    <Card className="shadow-lg rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-2xl font-headline tracking-tight">
              <ClipboardList className="mr-2 h-6 w-6 text-primary" />
              {workoutPlan.name || dict?.title || "Your Workout Plan"}
            </CardTitle>
            {planDescription && ( 
              <CardDescription className="mt-1 flex items-center leading-relaxed">
                <Info className="mr-1.5 h-4 w-4 text-muted-foreground" />
                {planDescription}
              </CardDescription>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DifficultyIcon difficulty={workoutPlan.difficulty} />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{workoutPlan.difficulty.charAt(0).toUpperCase() + workoutPlan.difficulty.slice(1)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" disabled={isRegenerating} className="transition-all duration-200 active:scale-95">
                    {isRegenerating ? 'Regenerating…' : 'Regenerate'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRegenerate('more cardio')}>More cardio</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRegenerate('less equipment')}>Less equipment</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRegenerate('core focus')}>Core focus</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRegenerate('shorter duration')}>Shorter duration</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRegenerate('add warm-up and cooldown')}>Add warm-up & cooldown</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />{workoutPlan.muscleGroups}
          </Badge>
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />{workoutPlan.availableTime} min
          </Badge>
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-foreground flex items-center gap-1">
            <Dumbbell className="h-3 w-3" />{workoutPlan.equipment}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {workoutPlan.exercises.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {dict?.includesExercises || "Includes exercises:"}
            </p>
            <p className="text-muted-foreground text-sm italic">
              {exerciseSummary}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">{dict?.noExercises || "No exercises in this plan. Try generating a new one!"}</p>
        )}
      </CardContent>
      {!isWorkoutActive && workoutPlan.exercises.length > 0 && (
        <CardFooter>
          <Button 
            onClick={onStartWorkout} 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:scale-[.98]"
            size="lg"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            {dict?.startWorkoutButton || "Start Workout"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
