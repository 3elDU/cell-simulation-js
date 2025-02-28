export const supportedLanguages = [
  "en", // English
  "uk", // Ukrainian
  "ru", // Russian
] as const;
export type SupportedLanguageCode = (typeof supportedLanguages)[number];
export const languageNames: Record<SupportedLanguageCode, string> = {
  en: "English",
  ru: "Русский",
  uk: "Українська",
};

/**
 * The language chosen by the user in their system.
 * This may be not the final language of the application.
 * If user's language is not supported, we fall back to English.
 */
export const userLanguage = new Intl.Locale(navigator.language).language;
export const userLanguageSupported = (
  supportedLanguages as ReadonlyArray<string>
).includes(userLanguage);

/**
 * The default initial language for the application. User can change it in the settings.
 * If users's native language is supported, it is selected. Otherwise, we fall back to English.
 */
export const language: SupportedLanguageCode = userLanguageSupported
  ? (userLanguage as SupportedLanguageCode)
  : "en";

export type MessageRegistry = Record<string, Message>;

export type Message = Record<SupportedLanguageCode, string>;
