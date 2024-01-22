import { useContext } from "react";
import type { Locale } from "types";
import { I18nContext } from "store";
import { useDefaultLocale } from "./use-default-locale";

/**
 * Returns the current locale and layout direction.
 */
export function useLocale(): Locale {
  const defaultLocale = useDefaultLocale();
  const context = useContext(I18nContext);
  return context || defaultLocale;
}
