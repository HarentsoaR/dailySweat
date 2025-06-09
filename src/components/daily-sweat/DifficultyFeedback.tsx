"use client";

import type { DifficultyFeedbackOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsDown, ThumbsUp, CheckCircle2, Smile, Frown, Meh } from 'lucide-react';

interface DifficultyFeedbackProps {
  onFeedbackSubmit: (feedback: DifficultyFeedbackOption) => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
}

const feedbackOptions: { label: string; value: DifficultyFeedbackOption; icon: React.ElementType }[] = [
  { label: "Too Easy", value: "too easy", icon: Frown },
  { label: "Just Right", value: "just right", icon: Smile },
  { label: "Too Hard", value: "too hard", icon: Meh }, // Using Meh as a neutral for too hard, can be changed
];


export function DifficultyFeedback({ onFeedbackSubmit, isLoading, disabled }: DifficultyFeedbackProps) {
  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
          Rate Your Workout
        </CardTitle>
        <CardDescription>
          Help us improve your next workout by rating the difficulty of this plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-around gap-2">
          {feedbackOptions.map(option => (
            <Button
              key={option.value}
              variant="outline"
              onClick={() => onFeedbackSubmit(option.value)}
              disabled={isLoading || disabled}
              className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              <option.icon className="mr-2 h-4 w-4" />
              {option.label}
            </Button>
          ))}
        </div>
        {isLoading && <p className="text-sm text-muted-foreground mt-2 text-center">Adjusting workout...</p>}
      </CardContent>
    </Card>
  );
}
