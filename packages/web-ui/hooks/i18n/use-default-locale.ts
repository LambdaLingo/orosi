import { useEffect, useState } from "react";
import type { Locale } from "types";
import { useIsSSR } from "hooks";
import { isRTL } from "utilities";
// Locale passed from server by PackageLocalizationProvider.
const localeSymbol = Symbol.for("react-aria.i18n.locale");

/**
 * Gets the locale setting of the browser.
 */
export function getDefaultLocale(): Locale {
  //@ts-expect-error -- TODO: Check if this is still needed.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-assignment -- can be undefined
  let locale: string = window?.[localeSymbol] ?? navigator?.language ?? "en-US";

  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch (_err) {
    locale = "en-US";
  }
  return {
    locale,
    direction: isRTL(locale) ? "rtl" : "ltr",
  };
}

let currentLocale = getDefaultLocale();
const listeners = new Set<(locale: Locale) => void>();

function updateLocale(): void {
  currentLocale = getDefaultLocale();
  for (const listener of listeners) {
    listener(currentLocale);
  }
}

/**
 * Returns the current browser/system language, and updates when it changes.
 */
export function useDefaultLocale(): Locale {
  const isSSR = useIsSSR();
  const [defaultLocale, setDefaultLocale] = useState(currentLocale);

  useEffect(() => {
    if (listeners.size === 0) {
      window.addEventListener("languagechange", updateLocale);
    }

    listeners.add(setDefaultLocale);

    return () => {
      listeners.delete(setDefaultLocale);
      if (listeners.size === 0) {
        window.removeEventListener("languagechange", updateLocale);
      }
    };
  }, []);

  // We cannot determine the browser's language on the server, so default to
  // en-US. This will be updated after hydration on the client to the correct value.
  if (isSSR) {
    return {
      locale: "en-US",
      direction: "ltr",
    };
  }

  return defaultLocale;
}
