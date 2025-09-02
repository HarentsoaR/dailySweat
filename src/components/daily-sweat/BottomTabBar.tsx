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

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="grid grid-cols-4 gap-1 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <Button
          variant={active === "home" ? "default" : "ghost"}
          className="flex flex-col items-center justify-center h-14"
          onClick={() => router.push(`/${lang}`)}
          aria-label="Home"
        >
          <Home className="h-5 w-5" />
          <span className="text-[11px] leading-3">Home</span>
        </Button>
        <Button
          variant={active === "workout" ? "default" : "ghost"}
          className="flex flex-col items-center justify-center h-14"
          onClick={() => onChange("workout")}
          aria-label="Generate"
        >
          <Dumbbell className="h-5 w-5" />
          <span className="text-[11px] leading-3">Generate</span>
        </Button>
        <Button
          variant={active === "history" ? "default" : "ghost"}
          className="flex flex-col items-center justify-center h-14"
          onClick={() => onChange("history")}
          aria-label="History"
        >
          <HistoryIcon className="h-5 w-5" />
          <span className="text-[11px] leading-3">History</span>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant={active === "settings" ? "default" : "ghost"}
              className="flex flex-col items-center justify-center h-14"
              aria-label="Settings"
            >
              <SettingsIcon className="h-5 w-5" />
              <span className="text-[11px] leading-3">Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Language</span>
                <LanguageSwitcher />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

