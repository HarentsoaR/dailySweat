import { Dumbbell } from 'lucide-react';
import { ThemeToggle } from '@/components/daily-sweat/ThemeToggle';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="ml-3 text-2xl font-bold text-foreground font-headline">
            {title}
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
