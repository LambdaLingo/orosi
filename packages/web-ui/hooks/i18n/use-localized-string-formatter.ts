import { useMemo } from "react";
import type { LocalizedString, LocalizedStrings } from "intl";
import { LocalizedStringFormatter } from "intl";
import { useLocale } from "./use-locale";
import { useLocalizedStringDictionary } from "./use-localized-string-dictionary";

/**
 * Provides localized string formatting for the current locale. Supports interpolating variables,
 * selecting the correct pluralization, and formatting numbers. Automatically updates when the locale changes.
 * @param strings - A mapping of languages to localized strings by key.
 */
export function useLocalizedStringFormatter<
  K extends string = string,
  T extends LocalizedString = string,
>(
  strings: LocalizedStrings<K, T>,
  packageName?: string
): LocalizedStringFormatter<K, T> {
  const { locale } = useLocale();
  const dictionary = useLocalizedStringDictionary(strings, packageName);
  return useMemo(
    () => new LocalizedStringFormatter(locale, dictionary),
    [locale, dictionary]
  );
}
