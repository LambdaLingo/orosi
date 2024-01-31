import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Key,
  SelectionMode,
  MultipleSelectionState,
  MultipleSelectionStateProps,
} from "types";
import { Selection } from "classes";
import { useControlledState } from "hooks/shared";

function equalSets(setA: Set<Key>, setB: Set<Key>): boolean {
  if (setA.size !== setB.size) {
    return false;
  }

  for (const item of setA) {
    if (!setB.has(item)) {
      return false;
    }
  }

  return true;
}

/**
 * Manages state for multiple selection and focus in a collection.
 */
export function useMultipleSelectionState(
  props: MultipleSelectionStateProps
): MultipleSelectionState {
  const {
    selectionMode = "none" as SelectionMode,
    disallowEmptySelection,
    allowDuplicateSelectionEvents,
    selectionBehavior: selectionBehaviorProp = "toggle",
    disabledBehavior = "all",
  } = props;

  // We want synchronous updates to `isFocused` and `focusedKey` after their setters are called.
  // But we also need to trigger a react re-render. So, we have both a ref (sync) and state (async).
  const isFocusedRef = useRef(false);
  const [, setFocused] = useState(false);
  const focusedKeyRef = useRef(null);
  const childFocusStrategyRef = useRef(null);
  const [, setFocusedKey] = useState(null);
  const selectedKeysProp = useMemo(
    () => convertSelection(props.selectedKeys),
    [props.selectedKeys]
  );
  const defaultSelectedKeys = useMemo(
    () => convertSelection(props.defaultSelectedKeys, new Selection()),
    [props.defaultSelectedKeys]
  );
  const [selectedKeys, setSelectedKeys] = useControlledState(
    selectedKeysProp,
    defaultSelectedKeys,
    props.onSelectionChange
  );
  const disabledKeysProp = useMemo(
    () => (props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()),
    [props.disabledKeys]
  );
  const [selectionBehavior, setSelectionBehavior] = useState(
    selectionBehaviorProp
  );

  // If the selectionBehavior prop is set to replace, but the current state is toggle (e.g. due to long press
  // to enter selection mode on touch), and the selection becomes empty, reset the selection behavior.
  if (
    selectionBehaviorProp === "replace" &&
    selectionBehavior === "toggle" &&
    typeof selectedKeys === "object" &&
    selectedKeys.size === 0
  ) {
    setSelectionBehavior("replace");
  }

  // If the selectionBehavior prop changes, update the state as well.
  const lastSelectionBehavior = useRef(selectionBehaviorProp);
  useEffect(() => {
    if (selectionBehaviorProp !== lastSelectionBehavior.current) {
      setSelectionBehavior(selectionBehaviorProp);
      lastSelectionBehavior.current = selectionBehaviorProp;
    }
  }, [selectionBehaviorProp]);

  return {
    selectionMode,
    disallowEmptySelection,
    selectionBehavior,
    setSelectionBehavior,
    get isFocused() {
      return isFocusedRef.current;
    },
    setFocused(f) {
      isFocusedRef.current = f;
      setFocused(f);
    },
    get focusedKey() {
      return focusedKeyRef.current;
    },
    get childFocusStrategy() {
      return childFocusStrategyRef.current;
    },
    setFocusedKey(k, childFocusStrategy = "first") {
      focusedKeyRef.current = k;
      childFocusStrategyRef.current = childFocusStrategy;
      setFocusedKey(k);
    },
    selectedKeys,
    setSelectedKeys(keys) {
      if (allowDuplicateSelectionEvents || !equalSets(keys, selectedKeys)) {
        setSelectedKeys(keys);
      }
    },
    disabledKeys: disabledKeysProp,
    disabledBehavior,
  };
}

function convertSelection(
  selection: "all" | Iterable<Key>,
  defaultValue?: Selection
): "all" | Set<Key> {
  if (!selection) {
    return defaultValue;
  }

  return selection === "all" ? "all" : new Selection(selection);
}
