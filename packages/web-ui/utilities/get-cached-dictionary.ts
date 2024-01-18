import type { LocalizedString, LocalizedStrings } from "intl";
import { LocalizedStringDictionary } from "intl";

const cache = new WeakMap();
export function getCachedDictionary<
  K extends string,
  T extends LocalizedString,
>(strings: LocalizedStrings<K, T>): LocalizedStringDictionary<K, T> {
  let dictionary = cache.get(strings);
  if (!dictionary) {
    dictionary = new LocalizedStringDictionary(strings);
    cache.set(strings, dictionary);
  }

  return dictionary;
}
