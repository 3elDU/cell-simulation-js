import {
  language as defaultLanguage,
  type SupportedLanguageCode,
} from "@/i18n";
import { useLocalStorage } from "@vueuse/core";

const language = useLocalStorage<SupportedLanguageCode>(
  "language",
  defaultLanguage
);

export default function useLanguage() {
  const setLanguage = (newLanguage: SupportedLanguageCode) => {
    language.value = newLanguage;
  };

  return { language, setLanguage };
}
