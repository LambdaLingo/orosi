import { useContext } from "react";
import { I18nContext } from "store";
import { type Locale, useDefaultLocale } from "./use-default-locale";

/**
 * Returns the current locale and layout direction.
 */
export function useLocale(): Locale {
  const defaultLocale = useDefaultLocale();
  const context = useContext(I18nContext);
  return context || defaultLocale;
}
