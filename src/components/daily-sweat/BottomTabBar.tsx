"use client";

import { useParams, useRouter } from "next/navigation";
import { Dumbbell, Home, History as HistoryIcon, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/daily-sweat/ThemeToggle";
import { LanguageSwitcher } from "@/components/daily-sweat/LanguageSwitcher";

interface BottomTabBarProps {
  active: "home" | "workout" | "history" | "settings";
  onChange: (tab: "workout" | "history") => void;
}

export function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  const isActive = (tab: BottomTabBarProps["active"]) => active === tab;

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="grid grid-cols-4 gap-1 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <Button
          variant={isActive("home") ? "default" : "ghost"}
          className="relative flex flex-col items-center justify-center h-14 transition-transform active:scale-95"
          onClick={() => router.push(`/${lang}`)}
          aria-label="Home"
        >
          {isActive("home") && <span aria-hidden className="absolute -top-px left-0 right-0 h-0.5 bg-primary rounded-t" />}
          <Home className={`h-5 w-5 ${isActive("home") ? 'text-primary-foreground' : ''}`} />
          <span className="text-[11px] leading-3">Home</span>
        </Button>
        <Button
          variant={isActive("workout") ? "default" : "ghost"}
          className="relative flex flex-col items-center justify-center h-14 transition-transform active:scale-95"
          onClick={() => onChange("workout")}
          aria-label="Generate"
        >
          {isActive("workout") && <span aria-hidden className="absolute -top-px left-0 right-0 h-0.5 bg-primary rounded-t" />}
          <Dumbbell className={`h-5 w-5 ${isActive("workout") ? 'text-primary-foreground' : ''}`} />
          <span className="text-[11px] leading-3">Generate</span>
        </Button>
        <Button
          variant={isActive("history") ? "default" : "ghost"}
          className="relative flex flex-col items-center justify-center h-14 transition-transform active:scale-95"
          onClick={() => onChange("history")}
          aria-label="History"
        >
          {isActive("history") && <span aria-hidden className="absolute -top-px left-0 right-0 h-0.5 bg-primary rounded-t" />}
          <HistoryIcon className={`h-5 w-5 ${isActive("history") ? 'text-primary-foreground' : ''}`} />
          <span className="text-[11px] leading-3">History</span>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant={isActive("settings") ? "default" : "ghost"}
              className="relative flex flex-col items-center justify-center h-14 transition-transform active:scale-95"
              aria-label="Settings"
            >
              {isActive("settings") && <span aria-hidden className="absolute -top-px left-0 right-0 h-0.5 bg-primary rounded-t" />}
              <SettingsIcon className={`h-5 w-5 ${isActive("settings") ? 'text-primary-foreground' : ''}`} />
              <span className="text-[11px] leading-3">Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader className="border-b pb-2">
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <LanguageSwitcher />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

