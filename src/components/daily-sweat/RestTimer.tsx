"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Pause, Play, RotateCcw, TimerIcon as TimerLucideIcon, SkipForward } from 'lucide-react'; // Added SkipForward icon
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface RestTimerProps {
  initialDuration: number; // in seconds
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onTimerEnd: () => void;
  onSkip: () => void; // New prop for skipping rest
  timerKey: number; // To force re-initialization
  dict: { 
    title?: string;
    description?: string;
    pauseButtonSR?: string;
    playButtonSR?: string;
    resetButtonSR?: string;
    skipButton?: string; // New
    skipButtonSR?: string; // New
  };
}

export function RestTimer({
  initialDuration,
  isRunning,
  onToggle,
  onReset,
  onTimerEnd,
  onSkip, // Destructure new prop
  timerKey,
  dict,
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setTimeLeft(initialDuration);
  }, [initialDuration, timerKey]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else {
      clearTimerInterval();
    }
    return clearTimerInterval;
  }, [isRunning, timeLeft, clearTimerInterval]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      onTimerEnd();
    }
  }, [timeLeft, isRunning, onTimerEnd]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const progressPercentage = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;

  return (
    <Card className={cn("shadow-md w-full max-w-md mx-auto")}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          <TimerLucideIcon className="mr-2 h-5 w-5 text-primary" />
          {dict?.title || "Rest Timer"}
        </CardTitle>
        <CardDescription>{dict?.description || "Take a breather, then hit it hard!"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-5xl font-bold font-mono text-primary tabular-nums transition-colors duration-300">
            {formatTime(timeLeft)}
          </p>
        </div>
        <Progress value={progressPercentage} className="h-3 [&>div]:bg-accent transition-all duration-1000 ease-linear" />
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="icon" onClick={onToggle} className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span className="sr-only">{isRunning ? (dict?.pauseButtonSR || 'Pause') : (dict?.playButtonSR || 'Play')}</span>
          </Button>
          <Button variant="outline" size="icon" onClick={onReset} className="border-muted-foreground text-muted-foreground hover:bg-muted hover:text-muted-foreground">
            <RotateCcw className="h-5 w-5" />
            <span className="sr-only">{dict?.resetButtonSR || "Reset"}</span>
          </Button>
          <Button variant="outline" size="icon" onClick={onSkip} className="border-destructive text-destructive hover:bg-destructive/10">
            <SkipForward className="h-5 w-5" />
            <span className="sr-only">{dict?.skipButtonSR || "Skip rest period"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}