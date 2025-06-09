
import type { Exercise } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Repeat, Target, TimerIcon, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExerciseCardProps {
  exercise: Exercise;
  onStartRest: (duration: number) => void;
  dict: {
    setsLabel?: string;
    repsLabel?: string;
    restLabel?: string;
    startRestButton?: string;
    exerciseInfoTooltip?: string;
  };
}

export function ExerciseCard({ exercise, onStartRest, dict }: ExerciseCardProps) {
  const startRestButtonText = (dict?.startRestButton || "Start Rest ({duration}s)").replace('{duration}', String(exercise.rest));
  return (
    <Card className="mb-4 shadow-md transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center text-xl font-headline">
          <Dumbbell className="mr-2 h-5 w-5 text-primary" />
          {exercise.name}
        </CardTitle>
        {exercise.description && (
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-popover text-popover-foreground p-2 rounded shadow-lg">
                <p>{exercise.description}</p>
                <p className="sr-only">{dict?.exerciseInfoTooltip || "Exercise Information"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm">
          <Repeat className="mr-2 h-4 w-4 text-accent" />
          <span className="font-semibold">{dict?.setsLabel || "Sets:"}</span>
          <span className="ml-1">{exercise.sets}</span>
        </div>
        <div className="flex items-center text-sm">
          <Target className="mr-2 h-4 w-4 text-accent" />
          <span className="font-semibold">{dict?.repsLabel || "Reps:"}</span>
          <span className="ml-1">{exercise.reps}</span>
        </div>
        <div className="flex items-center text-sm">
          <TimerIcon className="mr-2 h-4 w-4 text-accent" />
          <span className="font-semibold">{dict?.restLabel || "Rest:"}</span>
          <span className="ml-1">{exercise.rest} seconds</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartRest(exercise.rest)}
          className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <TimerIcon className="mr-2 h-4 w-4" />
          {startRestButtonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

