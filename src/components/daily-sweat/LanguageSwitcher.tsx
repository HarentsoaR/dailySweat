
"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguagesIcon, Check } from "lucide-react"; // Using a generic icon

// Must match locales in middleware.ts and dictionaries.ts
const supportedLocales = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "it", name: "Italiano" },
  { code: "zh", name: "中文" },
];

interface LanguageSwitcherProps {
  dictionary?: { // Optional dictionary for future labels within the switcher itself
    selectLanguageTooltip?: string;
  };
}

export function LanguageSwitcher({ dictionary }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = params.lang as string || "en";

  const handleLanguageChange = (newLocale: string) => {
    if (!pathname) return;

    // Replace the current locale in the pathname with the new one
    // e.g., /en/some-page -> /fr/some-page
    // e.g., /en -> /fr
    const newPathname = pathname.startsWith(`/${currentLang}`)
      ? pathname.replace(`/${currentLang}`, `/${newLocale}`)
      : `/${newLocale}${pathname}`;

    router.push(newPathname);
  };

  const currentLocaleDetails = supportedLocales.find(loc => loc.code === currentLang) || supportedLocales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9" aria-label={dictionary?.selectLanguageTooltip || "Change language"}>
           {/* Display current language code or a generic icon */}
          <span className="text-xs font-medium">{currentLocaleDetails.code.toUpperCase()}</span>
          {/* <LanguagesIcon className="h-[1.1rem] w-[1.1rem]" /> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLocales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLanguageChange(locale.code)}
            className="flex justify-between items-center"
          >
            {locale.name}
            {currentLang === locale.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
