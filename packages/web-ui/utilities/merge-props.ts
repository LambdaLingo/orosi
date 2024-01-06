import { chain } from "./chain";
import { mergeIds } from "./merge-ids";

type Props = Record<string, unknown>;

type PropsArg = Props | null | undefined;

// taken from: https://stackoverflow.com/questions/51603250/typescript-3-parameter-list-intersection-type/51604379#51604379
type NullToObject<T> = T extends null | undefined ? Record<string, never> : T;
type TupleToUnion<T> = { [P in keyof T]: T[P] } extends Record<number, infer V>
  ? NullToObject<V>
  : never;
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Merges multiple props objects together. Event handlers are chained,
 * classNames are combined, and ids are deduplicated - different ids
 * will trigger a side-effect and re-render components hooked up with `useId`.
 * For all other props, the last prop object overrides all previous ones.
 * @param args - Multiple sets of props to merge together.
 */
export function mergeProps<T extends PropsArg[]>(
  ...args: T
): UnionToIntersection<TupleToUnion<T>> {
  // Start with a base clone of the first argument. This is a lot faster than starting
  // with an empty object and adding properties as we go.
  const result: Props = { ...args[0] };
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    for (const key in props) {
      const a = result[key];
      const b = props[key];

      // Chain events
      if (
        typeof a === "function" &&
        typeof b === "function" &&
        // This is a lot faster than a regex.
        key.startsWith("o") &&
        key[1] === "n" &&
        key.charCodeAt(2) >= /* 'A' */ 65 &&
        key.charCodeAt(2) <= /* 'Z' */ 90
      ) {
        result[key] = chain(a, b);
      } else if (key === "id" && a && b) {
        if (typeof a === "string" && typeof b === "string") {
          result.id = mergeIds(a, b);
        } else if (typeof a === "string") {
          result.id = a;
        } else if (typeof b === "string") {
          result.id = b;
        } else {
          result.id = undefined;
        }
        // Override others
      } else {
        result[key] = b !== undefined ? b : a;
      }
    }
  }

  return result as UnionToIntersection<TupleToUnion<T>>;
}
