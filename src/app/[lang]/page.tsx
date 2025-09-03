
import { getDictionary } from '@/lib/dictionaries';
import type { DictionaryType } from '@/lib/types';
import DailySweatClientPage from './DailySweatClientPage';

type Lang = 'en' | 'fr' | 'es' | 'it' | 'zh';

interface DailySweatPageContainerProps {
  params: { lang: Lang };
}

// This is now a Server Component responsible for fetching the dictionary
export default async function DailySweatPageContainer({ params }: DailySweatPageContainerProps) {
  const dictionary = await getDictionary(params.lang);

  // Pass the dictionary and params to the Client Component
  return <DailySweatClientPage params={params} dictionary={dictionary} />;
}