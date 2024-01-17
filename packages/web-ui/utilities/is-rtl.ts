// https://en.wikipedia.org/wiki/Right-to-left

import { RTL_LANGS, RTL_SCRIPTS } from "store";

/**
 * Determines if a locale is read right to left using [Intl.Locale]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale}.
 */
export function isRTL(localeString: string) {
  // If the Intl.Locale API is available, use it to get the locale's text direction.
  // @ts-ignore
  if (Intl.Locale) {
    let locale = new Intl.Locale(localeString).maximize();

    // Use the text info object to get the direction if possible.
    // @ts-ignore - this was implemented as a property by some browsers before it was standardized as a function.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo
    let textInfo =
      typeof locale.getTextInfo === "function"
        ? locale.getTextInfo()
        : locale.textInfo;
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
