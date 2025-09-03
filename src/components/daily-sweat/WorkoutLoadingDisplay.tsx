"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Dumbbell, Sparkles } from 'lucide-react';

interface WorkoutLoadingDisplayProps {
  dict: {
    title?: string;
    analyzingParams?: string;
    generatingPlan?: string;
    optimizingExercises?: string;
    finalizingWorkout?: string;
    aiCraftingMessage?: string;
  };
}

export function WorkoutLoadingDisplay({ dict }: WorkoutLoadingDisplayProps) {
  const loadingMessages = [
    { text: dict?.analyzingParams || 'Analyzing your parameters...', icon: Brain },
    { text: dict?.generatingPlan || 'Generating your personalized plan...', icon: Dumbbell },
    { text: dict?.optimizingExercises || 'Optimizing exercises for best results...', icon: Sparkles },
    { text: dict?.finalizingWorkout || 'Almost there, just a moment...', icon: Sparkles },
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  const CurrentIcon = loadingMessages[currentMessageIndex].icon;

  return (
    <Card className="shadow-lg h-full flex flex-col justify-center items-center text-center p-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-2xl font-headline text-primary gap-3">
          <span className="relative inline-flex items-center justify-center text-primary">
            {/* Dual-dot spinner, sized to fit heading */}
            <span className="spinner align-middle" aria-hidden>
              <i></i>
              <i></i>
            </span>
          </span>
          {dict?.title || 'Generating Workout'}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        <div className="flex items-center justify-center text-lg text-muted-foreground">
          <CurrentIcon className="mr-2 h-5 w-5 text-accent" />
          <p>{loadingMessages[currentMessageIndex].text}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {dict?.aiCraftingMessage || 'This might take a few moments as our AI crafts your perfect session.'}
        </p>
      </CardContent>

      {/* Scoped styles for the requested dual-dot spinner (smaller, theme-aware) */}
      <style jsx>{`
        .spinner { --size: 28px; --thickness: calc(var(--size) / 4.5); position: relative; width: var(--size); height: var(--size); display: inline-block; }
        .spinner > i { width: 100%; height: 100%; border-radius: 50%; border: var(--thickness) solid hsl(var(--primary)/0.1); position: absolute; top: 0; left: 0; animation: spinner-g7vlvwmd 0.65s linear infinite; z-index: 0; }
        .spinner > i::before { content: ''; height: var(--thickness); width: var(--thickness); border-radius: 50%; background: hsl(var(--primary)); position: absolute; top: 50%; animation: spinner-h1vps1md 1.3s infinite reverse steps(1); transform: translate(calc(2 * var(--translate-2)), calc(var(--translate) * 1%)); z-index: 1; }
        .spinner > i:nth-of-type(1) { --translate: -50; --translate-2: calc(var(--size) / 8); }
        .spinner > i:nth-of-type(1)::before { right: 0; }
        .spinner > i:nth-of-type(2) { --translate: 50; --translate-2: calc(-1 * (var(--size) / 8)); animation-delay: 0.65s; animation-direction: reverse; transform: translate(calc(var(--size) * 0.38), 0); }
        .spinner > i:nth-of-type(2)::before { left: 0; transform: translate(calc(-1 * (var(--size) / 4)), -50%); animation-direction: normal; }
        @keyframes spinner-h1vps1md { 0% { opacity: 0; } 50% { opacity: 1; } }
        @keyframes spinner-g7vlvwmd { from { transform: translate(calc(var(--translate) * 1%), 0) translate(calc(var(--translate-2)), 0) rotate(0deg); } to { transform: translate(calc(var(--translate) * 1%), 0) translate(calc(var(--translate-2)), 0) rotate(360deg); } }
      `}</style>
    </Card>
  );
}