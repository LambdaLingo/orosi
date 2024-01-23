import { RTL_LANGS, RTL_SCRIPTS } from "store";

/**
 * Determines if a locale is read right to left using [Intl.Locale]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale}.
 */
export function isRTL(localeString: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- If the Intl.Locale API is available, use it to get the locale's text direction.
  if (Intl.Locale) {
    const locale = new Intl.Locale(localeString).maximize();

    // Use the text info object to get the direction if possible.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo
    const textInfo: { direction: string } | undefined =
      // @ts-expect-error - this was implemented as a property by some browsers before it was standardized as a function.
      typeof (locale.getTextInfo as () => { direction: string }) === "function"
        ? // @ts-expect-error - this was implemented as a property by some browsers before it was standardized as a function.
          (locale.getTextInfo as () => { direction: string })()
        : // @ts-expect-error - this was implemented as a property by some browsers before it was standardized as a function.
          (locale.textInfo as { direction: string });
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- If the text info object exists, use it to get the direction.
    if (textInfo) {
      return textInfo.direction === "rtl";
    }

    // Fallback: guess using the script.
    // This is more accurate than guessing by language, since languages can be written in multiple scripts.
    if (locale.script) {
      return RTL_SCRIPTS.has(locale.script);
    }
  }

  // If not, just guess by the language (first part of the locale)
  const lang = localeString.split("-")[0];
  return RTL_LANGS.has(lang);
}
