import type { LocalizedString } from "./localized-string-formatter";

export type LocalizedStrings<
  K extends string,
  T extends LocalizedString,
> = Record<string, Record<K, T>>;

const localeSymbol = Symbol.for("react-aria.i18n.locale");
const stringsSymbol = Symbol.for("react-aria.i18n.strings");
let cachedGlobalStrings:
  | Record<string, LocalizedStringDictionary<any, any>>
  | null
  | undefined;

/**
 * Stores a mapping of localized strings. Can be used to find the
 * closest available string for a given locale.
 */
export class LocalizedStringDictionary<
  K extends string = string,
  T extends LocalizedString = string,
> {
  private strings: LocalizedStrings<K, T>;
  private defaultLocale: string;

  constructor(messages: LocalizedStrings<K, T>, defaultLocale = "en-US") {
    // Clone messages so we don't modify the original object.
    this.strings = { ...messages };
    this.defaultLocale = defaultLocale;
  }

  /** Returns a localized string for the given key and locale. */
  getStringForLocale(key: K, locale: string): T {
    const strings = this.getStringsForLocale(locale);
    const string = strings[key];
    if (!string) {
      throw new Error(`Could not find intl message ${key} in ${locale} locale`);
    }

    return string;
  }

  /** Returns all localized strings for the given locale. */
  getStringsForLocale(locale: string): Record<K, T> {
    let strings = this.strings[locale];
    if (!strings) {
      strings = getStringsForLocale(locale, this.strings, this.defaultLocale);
      this.strings[locale] = strings;
    }

    return strings;
  }

  static getGlobalDictionaryForPackage<
    K extends string = string,
    T extends LocalizedString = string,
  >(packageName: string): LocalizedStringDictionary<K, T> | null {
    if (typeof window === "undefined") {
      return null;
    }
    //@ts-expect-error -- TODO: Check if this is still needed.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- can be undefined
    const locale = window[localeSymbol];
    if (cachedGlobalStrings === undefined) {
      //@ts-expect-error -- TODO: Check if this is still needed.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- can be undefined
      const globalStrings = window[stringsSymbol];
      if (!globalStrings) {
        return null;
      }

      cachedGlobalStrings = {};
      for (const pkg in globalStrings) {
        cachedGlobalStrings[pkg] = new LocalizedStringDictionary(
          { [locale]: globalStrings[pkg] },
          locale
        );
      }
    }

    const dictionary = cachedGlobalStrings?.[packageName];
    if (!dictionary) {
      throw new Error(
        `Strings for package "${packageName}" were not included by LocalizedStringProvider. Please add it to the list passed to createLocalizedStringDictionary.`
      );
    }

    return dictionary;
  }
}

function getStringsForLocale<K extends string, T extends LocalizedString>(
  locale: string,
  strings: LocalizedStrings<K, T>,
  defaultLocale = "en-US"
): Record<K, T> {
  // If there is an exact match, use it.
  if (strings[locale]) {
    return strings[locale];
  }

  // Attempt to find the closest match by language.
  // For example, if the locale is fr-CA (French Canadian), but there is only
  // an fr-FR (France) set of strings, use that.
  // This could be replaced with Intl.LocaleMatcher once it is supported.
  // https://github.com/tc39/proposal-intl-localematcher
  const language = getLanguage(locale);
  if (strings[language]) {
    return strings[language];
  }

  for (const key in strings) {
    if (key.startsWith(`${language}-`)) {
      return strings[key];
    }
  }

  // Nothing close, use english.
  return strings[defaultLocale];
}

function getLanguage(locale: string): string {
  if (Intl.Locale) {
    return new Intl.Locale(locale).language;
  }

  return locale.split("-")[0];
}
