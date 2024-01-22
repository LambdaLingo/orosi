import { useMemo } from "react";
import { NumberFormatter, type NumberFormatOptions } from "utilities";
import { useLocale } from "./use-locale";

/**
 * Provides localized number formatting for the current locale. Automatically updates when the locale changes,
 * and handles caching of the number formatter for performance.
 * @param options - Formatting options.
 */
export function useNumberFormatter(
  options: NumberFormatOptions = {}
): Intl.NumberFormat {
  const { locale } = useLocale();
  return useMemo(() => new NumberFormatter(locale, options), [locale, options]);
}
