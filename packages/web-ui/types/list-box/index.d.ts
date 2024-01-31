import type {
  AriaLabelingProps,
  CollectionBase,
  DOMProps,
  FocusEvents,
  FocusStrategy,
  Key,
  MultipleSelection,
  SelectionBehavior,
} from "types/shared";
import type { ReactNode } from "react";

export interface ListBoxProps<T>
  extends CollectionBase<T>,
    MultipleSelection,
    FocusEvents {
  /** Whether to auto focus the listbox or an option. */
  autoFocus?: boolean | FocusStrategy;
  /** Whether focus should wrap around when the end/start is reached. */
  shouldFocusWrap?: boolean;
}

interface AriaListBoxPropsBase<T>
  extends ListBoxProps<T>,
    DOMProps,
    AriaLabelingProps {}
export interface AriaListBoxProps<T> extends AriaListBoxPropsBase<T> {
  /**
   * An optional visual label for the listbox.
   */
  label?: ReactNode;
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior;
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends on
   * the collection's `selectionBehavior` prop and the interaction modality.
   */
  onAction?: (key: Key) => void;
}

export interface ListBoxAria {
  /** Props for the listbox element. */
  listBoxProps: DOMAttributes;
  /** Props for the listbox's visual label element (if any). */
  labelProps: DOMAttributes;
}

export interface AriaListBoxOptions<T>
  extends Omit<AriaListBoxProps<T>, "children"> {
  /** Whether the listbox uses virtual scrolling. */
  isVirtualized?: boolean;

  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate;

  /**
   * Whether the listbox items should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean;

  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean;

  /** Whether options should be focused when the user hovers over them. */
  shouldFocusOnHover?: boolean;

  /**
   * The behavior of links in the collection.
   * - 'action': link behaves like onAction.
   * - 'selection': link follows selection interactions (e.g. if URL drives selection).
   * - 'override': links override all other interactions (link items are not selectable).
   * @default 'override'
   */
  linkBehavior?: "action" | "selection" | "override";
}
