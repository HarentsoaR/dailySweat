
import type { WorkoutPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Flame, Leaf, Zap, Info, CalendarDays, Clock, Dumbbell, PlayCircle } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

interface WorkoutDisplayProps {
  workoutPlan: WorkoutPlan | null;
  onStartRest: (duration: number) => void;
  onStartWorkout: () => void;
  isWorkoutActive: boolean;
  dict: { // Dictionary for this component
    title: string;
    emptyState: string;
    startWorkoutButton: string;
  };
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

export function WorkoutDisplay({ workoutPlan, onStartRest, onStartWorkout, isWorkoutActive, dict }: WorkoutDisplayProps) {
  if (!workoutPlan) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline">
            <ClipboardList className="mr-2 h-6 w-6 text-primary" />
            {dict.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {dict.emptyState}
          </p>
        </CardContent>
      </Card>
    );
  }

  const planDescription = workoutPlan.name;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-2xl font-headline">
              <ClipboardList className="mr-2 h-6 w-6 text-primary" />
              {workoutPlan.name || dict.title}
            </CardTitle>
            {planDescription && planDescription !== workoutPlan.name && ( 
              <CardDescription className="mt-1 flex items-center">
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
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{workoutPlan.muscleGroups}</Badge>
          <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />{workoutPlan.availableTime} min</Badge>
          <Badge variant="secondary" className="flex items-center gap-1"><Dumbbell className="h-3 w-3" />{workoutPlan.equipment}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {workoutPlan.exercises.length > 0 ? (
          workoutPlan.exercises.map((exercise, index) => (
            <ExerciseCard key={index} exercise={exercise} onStartRest={onStartRest} />
          ))
        ) : (
          <p className="text-muted-foreground">No exercises in this plan. Try generating a new one!</p>
        )}
      </CardContent>
      {!isWorkoutActive && workoutPlan.exercises.length > 0 && (
        <CardFooter>
          <Button 
            onClick={onStartWorkout} 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            {dict.startWorkoutButton}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
