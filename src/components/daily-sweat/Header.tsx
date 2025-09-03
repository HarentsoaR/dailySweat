
import { Dumbbell } from 'lucide-react';
import { ThemeToggle } from '@/components/daily-sweat/ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher'; // Added import

interface HeaderProps {
  title: string;
  // We might pass a dictionary slice for the LanguageSwitcher if its internal labels need translation
  // For now, LanguageSwitcher handles its own labels or they are hardcoded.
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Accent top bar */}
      <div aria-hidden className="h-0.5 bg-gradient-to-r from-primary to-accent" />
      <div className="bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="ml-3 text-2xl md:text-3xl font-bold tracking-tight text-foreground font-headline">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2"> {/* Wrapper for toggles */}
          <LanguageSwitcher /> {/* Added LanguageSwitcher */}
          <ThemeToggle />
        </div>
      </div>
      </div>
    </header>
  );
}
