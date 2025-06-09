import { Dumbbell } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <div className="flex items-center">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="ml-3 text-2xl font-bold text-foreground font-headline">
            Daily Sweat
          </h1>
        </div>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
