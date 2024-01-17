import type { ReactNode } from "react";
import { type Locale, useDefaultLocale } from "hooks";
import { I18nContext } from "store";
import { isRTL } from "utilities";

export type I18nProviderProps = {
  /** Contents that should have the locale applied. */
  children: ReactNode;
  /** The locale to apply to the children. */
  locale?: string;
};

/**
 * Provides the locale for the application to all child components.
 */
export function I18nProvider(props: I18nProviderProps): ReactNode {
  const { locale, children } = props;
  const defaultLocale = useDefaultLocale();

  const value: Locale = locale
    ? {
        locale,
        direction: isRTL(locale) ? "rtl" : "ltr",
      }
    : defaultLocale;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
