import { useControlledState } from "hooks/shared";
import type { ToggleState, ToggleStateOptions } from "types";

/**
 * Provides state management for toggle components like checkboxes and switches.
 */
export function useToggleState(props: ToggleStateOptions = {}): ToggleState {
  const { isReadOnly } = props;

  // have to provide an empty function so useControlledState doesn't throw a fit
  // can't use useControlledState's prop calling because we need the event object from the change
  const [isSelected, setSelected] = useControlledState(
    props.isSelected,
    props.defaultSelected || false,
    props.onChange
  );

  function updateSelected(value: boolean): void {
    if (!isReadOnly) {
      setSelected(value);
    }
  }

  function toggleState(): void {
    if (!isReadOnly) {
      setSelected(!isSelected);
    }
  }

  return {
    isSelected,
    setSelected: updateSelected,
    toggle: toggleState,
  };
}
