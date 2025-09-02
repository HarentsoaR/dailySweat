"use client";

import React from 'react';
import type { WorkoutPlan, GenerateWorkoutInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, CalendarDays, Eye, Trash2, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '../ui/badge';
import { weeklyInsights } from '@/ai/flows/weekly-insights';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface WorkoutHistoryDisplayProps {
  history: WorkoutPlan[];
  onLoadWorkout: (workout: WorkoutPlan) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onClearHistory: () => void;
  dict: { 
    title?: string;
    description?: string;
    emptyState?: string;
    generatedOn?: string; 
    feedbackGiven?: string;
    viewButton?: string;
    deleteButton?: string;
    clearAllButton?: string;
  };
  lang?: string;
  onUseSuggestedParams?: (params: GenerateWorkoutInput) => void;
}

export function WorkoutHistoryDisplay({
  history,
  onLoadWorkout,
  onDeleteWorkout,
  onClearHistory,
  dict,
  lang,
  onUseSuggestedParams,
}: WorkoutHistoryDisplayProps) {
  const [insightsOpen, setInsightsOpen] = React.useState(false);
  const [insightsLoading, setInsightsLoading] = React.useState(false);
  const [insights, setInsights] = React.useState<{title:string;summary:string;suggestions:string[];nextSuggestedParams?:GenerateWorkoutInput}|null>(null);

  const handleInsights = async () => {
    setInsightsLoading(true);
    try {
      const result = await weeklyInsights({ historyJson: JSON.stringify(history), language: lang || 'en' });
      setInsights(result);
      setInsightsOpen(true);
    } finally {
      setInsightsLoading(false);
    }
  };
  if (history.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <History className="mr-2 h-5 w-5 text-primary" />
            {dict?.title || "Workout History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{dict?.emptyState || "No past workouts found. Complete some workouts to see them here!"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex-grow">
          <CardTitle className="flex items-center text-xl font-headline">
            <History className="mr-2 h-5 w-5 text-primary" />
            {dict?.title || "Workout History"}
          </CardTitle>
          <CardDescription>{dict?.description || "Review your past workout sessions."}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleInsights} disabled={insightsLoading}>
              {insightsLoading ? 'Analyzing…' : 'Weekly Insights'}
            </Button>
          )}
          {history.length > 0 && (
            <Button variant="destructive" size="sm" onClick={onClearHistory}>
              <Trash2 className="mr-1 h-3 w-3" /> {dict?.clearAllButton || "Clear All"}
            </Button>
          )}
        </div>
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
                  {(dict?.generatedOn || "Generated on: {date}").replace('{date}', format(parseISO(workout.generatedAt), "MMM d, yyyy 'at' h:mm a"))}
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
                        {(dict?.feedbackGiven || "Feedback: {feedback}").replace('{feedback}', workout.feedbackGiven)}
                    </p>
                </CardContent>
              )}
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => onLoadWorkout(workout)}>
                  <Eye className="mr-1 h-3 w-3" /> {dict?.viewButton || "View"}
                </Button>
                {/* The "Start Workout" button will now appear in the main WorkoutDisplay after viewing */}
              </CardFooter>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
    <Dialog open={insightsOpen} onOpenChange={setInsightsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{insights?.title || 'Weekly Progress Summary'}</DialogTitle>
          <DialogDescription>{insights?.summary}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {insights?.suggestions?.map((s, i) => (
            <p key={i} className="text-sm">• {s}</p>
          ))}
        </div>
        {insights?.nextSuggestedParams && onUseSuggestedParams && (
          <div className="mt-4 flex justify-end">
            <Button onClick={() => { onUseSuggestedParams!(insights.nextSuggestedParams!); setInsightsOpen(false); }}>Use Suggested Plan</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
