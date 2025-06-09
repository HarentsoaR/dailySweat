"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Pause, Play, RotateCcw, TimerIcon as TimerLucideIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface RestTimerProps {
  initialDuration: number; // in seconds
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onTimerEnd: () => void;
  timerKey: number; // To force re-initialization
  className?: string;
}

export function RestTimer({
  initialDuration,
  isRunning,
  onToggle,
  onReset,
  onTimerEnd,
  timerKey,
  className,
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
    clearTimerInterval(); // Clear any existing interval when key or initialDuration changes
    if (isRunning && initialDuration > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearTimerInterval();
            onTimerEnd(); 
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return clearTimerInterval;
  }, [initialDuration, isRunning, timerKey, onTimerEnd, clearTimerInterval]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const progressPercentage = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;

  if (initialDuration === 0) {
    return null; // Don't render timer if no duration is set
  }

  return (
    <Card className={cn("shadow-md sticky bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          <TimerLucideIcon className="mr-2 h-5 w-5 text-primary" />
          Rest Timer
        </CardTitle>
        <CardDescription>Take a breather, then hit it hard!</CardDescription>
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
            <span className="sr-only">{isRunning ? 'Pause' : 'Play'}</span>
          </Button>
          <Button variant="outline" size="icon" onClick={onReset} className="border-muted-foreground text-muted-foreground hover:bg-muted hover:text-muted-foreground">
            <RotateCcw className="h-5 w-5" />
            <span className="sr-only">Reset</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
