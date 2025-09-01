import { getDictionary } from "@/lib/dictionaries";
import { Header } from "@/components/daily-sweat/Header";
import { ActiveWorkoutClientPage } from "@/components/daily-sweat/ActiveWorkoutClientPage";
import type { Metadata } from 'next';

type Lang = 'en' | 'fr' | 'es' | 'it' | 'zh';

interface ActiveWorkoutPageProps {
  params: { lang: Lang; id: string };
}

export async function generateMetadata({ params }: ActiveWorkoutPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return {
    title: dict.page?.activeWorkoutPage?.title || dict.metadata.title,
    description: dict.metadata.description,
  };
}

export default async function ActiveWorkoutPage({ params }: ActiveWorkoutPageProps) {
  const dict = await getDictionary(params.lang);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title={dict.header?.title || "Daily Sweat"} />
      <ActiveWorkoutClientPage lang={params.lang} workoutId={params.id} dict={dict} />
      <footer className="text-center py-4 border-t text-sm text-muted-foreground mt-16">
        <p>{(dict.footer?.tagline || "© {year} Daily Sweat. Sweat Smarter, Not Harder.").replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </div>
  );
}