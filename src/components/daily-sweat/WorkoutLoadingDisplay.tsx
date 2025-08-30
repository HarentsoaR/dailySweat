"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Brain, Dumbbell, Sparkles } from 'lucide-react';

interface WorkoutLoadingDisplayProps {
  dict: {
    title?: string;
    analyzingParams?: string;
    generatingPlan?: string;
    optimizingExercises?: string;
    finalizingWorkout?: string;
    aiCraftingMessage?: string; // New dictionary key
  };
}

export function WorkoutLoadingDisplay({ dict }: WorkoutLoadingDisplayProps) {
  const loadingMessages = [
    { text: dict?.analyzingParams || "Analyzing your parameters...", icon: Brain },
    { text: dict?.generatingPlan || "Generating your personalized plan...", icon: Dumbbell },
    { text: dict?.optimizingExercises || "Optimizing exercises for best results...", icon: Sparkles },
    { text: dict?.finalizingWorkout || "Almost there, just a moment...", icon: Loader2 },
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  const CurrentIcon = loadingMessages[currentMessageIndex].icon;

  return (
    <Card className="shadow-lg h-full flex flex-col justify-center items-center text-center p-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-2xl font-headline text-primary">
          <Loader2 className="mr-3 h-7 w-7 animate-spin" />
          {dict?.title || "Generating Workout"}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        <div className="flex items-center justify-center text-lg text-muted-foreground">
          <CurrentIcon className="mr-2 h-5 w-5 text-accent" />
          <p>{loadingMessages[currentMessageIndex].text}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {dict?.aiCraftingMessage || "This might take a few moments as our AI crafts your perfect session."}
        </p>
      </CardContent>
    </Card>
  );
}