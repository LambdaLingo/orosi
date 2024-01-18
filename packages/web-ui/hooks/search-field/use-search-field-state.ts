import type { SearchFieldProps } from "types";
import { useControlledState } from "hooks/shared";

export type SearchFieldState = {
  /** The current value of the search field. */
  readonly value: string;

  /** Sets the value of the search field. */
  setValue: (value: string) => void;
};

/**
 * Provides state management for a search field.
 */
export function useSearchFieldState(props: SearchFieldProps): SearchFieldState {
  const [value, setValue] = useControlledState(
    toString(props.value),
    toString(props.defaultValue) || "",
    props.onChange
  );

  return {
    value,
    setValue,
  };
}

function toString(val) {
  if (val == null) {
    return;
  }

  return val.toString();
}
