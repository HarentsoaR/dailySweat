
"use client";

import type { DifficultyFeedbackOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Smile, Frown, Meh } from 'lucide-react';

interface DifficultyFeedbackProps {
  onFeedbackSubmit: (feedback: DifficultyFeedbackOption) => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
  dict: { // Dictionary for this component
    title: string;
    description: string;
    tooEasy: string;
    justRight: string;
    tooHard: string;
    adjusting: string;
  };
}

export function DifficultyFeedback({ onFeedbackSubmit, isLoading, disabled, dict }: DifficultyFeedbackProps) {
  const feedbackOptions: { label: string; value: DifficultyFeedbackOption; icon: React.ElementType }[] = [
    { label: dict.tooEasy, value: "too easy", icon: Frown },
    { label: dict.justRight, value: "just right", icon: Smile },
    { label: dict.tooHard, value: "too hard", icon: Meh },
  ];

  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
          {dict.title}
        </CardTitle>
        <CardDescription>
          {dict.description}
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
        {isLoading && <p className="text-sm text-muted-foreground mt-2 text-center">{dict.adjusting}</p>}
      </CardContent>
    </Card>
  );
}
