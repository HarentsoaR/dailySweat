
"use client";

import type { WorkoutPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, CalendarDays, Eye, Trash2, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';

interface WorkoutHistoryDisplayProps {
  history: WorkoutPlan[];
  onLoadWorkout: (workout: WorkoutPlan) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onClearHistory: () => void;
  dict: { // Dictionary for this component
    title: string;
    description: string;
    emptyState: string;
    generatedOn: string; // "Generated on: {date}"
    feedbackGiven: string; // "Feedback: {feedback}"
    viewButton: string;
    deleteButton: string;
    clearAllButton: string;
  };
}

export function WorkoutHistoryDisplay({
  history,
  onLoadWorkout,
  onDeleteWorkout,
  onClearHistory,
  dict,
}: WorkoutHistoryDisplayProps) {
  if (history.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <History className="mr-2 h-5 w-5 text-primary" />
            {dict.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{dict.emptyState}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex-grow">
          <CardTitle className="flex items-center text-xl font-headline">
            <History className="mr-2 h-5 w-5 text-primary" />
            {dict.title}
          </CardTitle>
          <CardDescription>{dict.description}</CardDescription>
        </div>
        {history.length > 0 && (
           <Button variant="destructive" size="sm" onClick={onClearHistory}>
            <Trash2 className="mr-1 h-3 w-3" /> {dict.clearAllButton}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {history.map((workout) => (
            <Card key={workout.id} className="mb-3 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                   <CalendarDays className="mr-2 h-4 w-4 text-accent"/>
                   {workout.name || "Workout Plan"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {dict.generatedOn.replace('{date}', format(parseISO(workout.generatedAt), "MMM d, yyyy 'at' h:mm a"))}
                </CardDescription>
                 <div className="flex flex-wrap gap-1 pt-1">
                    <Badge variant="outline">{workout.muscleGroups}</Badge>
                    <Badge variant="outline">{workout.difficulty}</Badge>
                  </div>
              </CardHeader>
              {workout.feedbackGiven && (
                <CardContent className="py-1 px-6">
                    <p className="text-xs text-muted-foreground flex items-center">
                        <Info className="mr-1 h-3 w-3"/>
                        {dict.feedbackGiven.replace('{feedback}', workout.feedbackGiven)}
                    </p>
                </CardContent>
              )}
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => onLoadWorkout(workout)}>
                  <Eye className="mr-1 h-3 w-3" /> {dict.viewButton}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteWorkout(workout.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-1 h-3 w-3" /> {dict.deleteButton}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
