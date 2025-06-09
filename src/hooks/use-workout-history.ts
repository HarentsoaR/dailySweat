"use client";

import type { WorkoutPlan } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

const WORKOUT_HISTORY_KEY = 'dailySweatWorkoutHistory';

export function useWorkoutHistory(initialHistory: WorkoutPlan[] = []) {
  const [history, setHistory] = useState<WorkoutPlan[]>(initialHistory);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(WORKOUT_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load workout history from localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) { // Only save after initial load to prevent overwriting
      try {
        localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(history));
      } catch (error) {
        console.error("Failed to save workout history to localStorage:", error);
      }
    }
  }, [history, isLoaded]);

  const addWorkoutToHistory = useCallback((workout: WorkoutPlan) => {
    setHistory((prevHistory) => {
      // Avoid duplicates by ID, keep the latest if ID matches
      const existingIndex = prevHistory.findIndex(item => item.id === workout.id);
      if (existingIndex !== -1) {
        const updatedHistory = [...prevHistory];
        updatedHistory[existingIndex] = workout;
        return updatedHistory;
      }
      return [workout, ...prevHistory].slice(0, 20); // Keep max 20 history items
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);
  
  const removeWorkoutFromHistory = useCallback((workoutId: string) => {
    setHistory(prevHistory => prevHistory.filter(workout => workout.id !== workoutId));
  }, []);


  return { history, addWorkoutToHistory, clearHistory, removeWorkoutFromHistory, isLoaded };
}
