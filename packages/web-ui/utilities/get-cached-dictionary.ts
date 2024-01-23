import {
  type LocalizedString,
  type LocalizedStrings,
  LocalizedStringDictionary,
} from "./i18n";

export function getCachedDictionary<
  K extends string,
  T extends LocalizedString,
>(strings: LocalizedStrings<K, T>): LocalizedStringDictionary<K, T> {
  const cache = new WeakMap<
    LocalizedStrings<K, T>,
    LocalizedStringDictionary<K, T>
  >();

  let dictionary = cache.get(strings);
  if (!dictionary) {
    dictionary = new LocalizedStringDictionary(strings);
    cache.set(strings, dictionary);
  }

  return dictionary;
}
