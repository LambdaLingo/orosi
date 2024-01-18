import { LocalizedStringDictionary } from "intl";
import type { LocalizedString, LocalizedStrings } from "intl";
import { getCachedDictionary } from "utilities";

/**
 * Returns a cached LocalizedStringDictionary for the given strings.
 */
export function useLocalizedStringDictionary<
  K extends string = string,
  T extends LocalizedString = string,
>(
  strings: LocalizedStrings<K, T>,
  packageName?: string
): LocalizedStringDictionary<K, T> {
  return (
    (packageName &&
      LocalizedStringDictionary.getGlobalDictionaryForPackage(packageName)) ||
    getCachedDictionary(strings)
  );
}
