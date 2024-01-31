import type { FormValidationState, RACValidation } from "types/form";
import type { ListState } from "types/list";
import type { OverlayTriggerState } from "types/overlays";
import type {
  AriaLabelingProps,
  CollectionBase,
  CollectionStateBase,
  DOMProps,
  FocusStrategy,
  FocusableDOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  Key,
  LabelableProps,
  Node,
  RenderChildren,
  SingleSelection,
  SlotProps,
  TextInputBase,
  Validation,
  DisabledBehavior,
  LongPressEvent,
  PressEvent,
  Selection,
  SelectionBehavior,
  SelectionMode,
  MultipleSelection,
} from "types/shared";

export type SelectBaseProps<T> = {
  /** Sets the open state of the menu. */
  isOpen?: boolean;
  /** Sets the default open state of the menu. */
  defaultOpen?: boolean;
  /** Method that is called when the open state of the menu changes. */
  onOpenChange?: (isOpen: boolean) => void;
} & CollectionBase<T> &
  Omit<InputBase, "isReadOnly"> &
  Validation<Key> &
  HelpTextProps &
  LabelableProps &
  TextInputBase &
  Omit<SingleSelection, "disallowEmptySelection"> &
  FocusableProps;

export type AriaSelectProps<T> = {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string;
  /**
   * The name of the input, used when submitting an HTML form.
   */
  name?: string;
} & SelectBaseProps<T> &
  DOMProps &
  AriaLabelingProps &
  FocusableDOMProps;
export type SelectRenderProps = {
  /**
   * Whether the select is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the select is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the select is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the select is currently open.
   * @selector [data-open]
   */
  isOpen: boolean;
  /**
   * Whether the select is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the select is required.
   * @selector [data-required]
   */
  isRequired: boolean;
};

export type SingleSelectListProps<T> = {
  /** Filter function to generate a filtered list of nodes. */
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>;
  /** @private */
  suppressTextValueWarning?: boolean;
} & CollectionStateBase<T> &
  Omit<SingleSelection, "disallowEmptySelection">;

export type SingleSelectListState<T> = {
  /** The key for the currently selected item. */
  readonly selectedKey: Key;

  /** Sets the selected key. */
  setSelectedKey: (key: Key | null) => void;

  /** The value of the currently selected item. */
  readonly selectedItem: Node<T>;
} & ListState<T>;

export type SelectProps<T extends object> = Omit<
  AriaSelectProps<T>,
  | "children"
  | "label"
  | "description"
  | "errorMessage"
  | "validationState"
  | "validationBehavior"
  | "items"
> &
  RACValidation &
  RenderChildren<SelectRenderProps> &
  SlotProps;
export type SelectStateOptions<T> = Omit<SelectBaseProps<T>, "children"> &
  CollectionStateBase<T>;

export type SelectState<T> = {
  /** Whether the select is currently focused. */
  readonly isFocused: boolean;

  /** Sets whether the select is focused. */
  setFocused: (isFocused: boolean) => void;

  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy;

  /** Opens the menu. */
  open: (focusStrategy?: FocusStrategy | null) => void;

  /** Toggles the menu. */
  toggle: (focusStrategy?: FocusStrategy | null) => void;
} & SingleSelectListState<T> &
  OverlayTriggerState &
  FormValidationState;

export type FocusState = {
  /** Whether the collection is currently focused. */
  readonly isFocused: boolean;
  /** Sets whether the collection is focused. */
  setFocused: (isFocused: boolean) => void;
  /** The current focused key in the collection. */
  readonly focusedKey: Key;
  /** Whether the first or last child of the focused key should receive focus. */
  readonly childFocusStrategy: FocusStrategy;
  /** Sets the focused key, and optionally, whether the first or last child of that key should receive focus. */
  setFocusedKey: (key: Key, child?: FocusStrategy) => void;
};

export type SingleSelectionState = {
  /** Whether the collection allows empty selection. */
  readonly disallowEmptySelection?: boolean;
  /** The currently selected key in the collection. */
  readonly selectedKey: Key;
  /** Sets the selected key in the collection. */
  setSelectedKey: (key: Key | null) => void;
} & FocusState;

export type MultipleSelectionState = {
  /** The type of selection that is allowed in the collection. */
  readonly selectionMode: SelectionMode;
  /** The selection behavior for the collection. */
  readonly selectionBehavior: SelectionBehavior;
  /** Sets the selection behavior for the collection. */
  setSelectionBehavior: (selectionBehavior: SelectionBehavior) => void;
  /** Whether the collection allows empty selection. */
  readonly disallowEmptySelection: boolean;
  /** The currently selected keys in the collection. */
  readonly selectedKeys: Selection;
  /** Sets the selected keys in the collection. */
  setSelectedKeys: (keys: Selection) => void;
  /** The currently disabled keys in the collection. */
  readonly disabledKeys: Set<Key>;
  /** Whether `disabledKeys` applies to selection, actions, or both. */
  readonly disabledBehavior: DisabledBehavior;
} & FocusState;

export type MultipleSelectionManager = {
  /** The type of selection that is allowed in the collection. */
  readonly selectionMode: SelectionMode;
  /** The selection behavior for the collection. */
  readonly selectionBehavior: SelectionBehavior;
  /** Whether the collection allows empty selection. */
  readonly disallowEmptySelection?: boolean;
  /** The currently selected keys in the collection. */
  readonly selectedKeys: Set<Key>;
  /** Whether the selection is empty. */
  readonly isEmpty: boolean;
  /** Whether all items in the collection are selected. */
  readonly isSelectAll: boolean;
  /** The first selected key in the collection. */
  readonly firstSelectedKey: Key | null;
  /** The last selected key in the collection. */
  readonly lastSelectedKey: Key | null;
  /** The currently disabled keys in the collection. */
  readonly disabledKeys: Set<Key>;
  /** Whether `disabledKeys` applies to selection, actions, or both. */
  readonly disabledBehavior: DisabledBehavior;
  /** Returns whether a key is selected. */
  isSelected: (key: Key) => boolean;
  /** Returns whether the current selection is equal to the given selection. */
  isSelectionEqual: (selection: Set<Key>) => boolean;
  /** Extends the selection to the given key. */
  extendSelection: (toKey: Key) => void;
  /** Toggles whether the given key is selected. */
  toggleSelection: (key: Key) => void;
  /** Replaces the selection with only the given key. */
  replaceSelection: (key: Key) => void;
  /** Replaces the selection with the given keys. */
  setSelectedKeys: (keys: Iterable<Key>) => void;
  /** Selects all items in the collection. */
  selectAll: () => void;
  /** Removes all keys from the selection. */
  clearSelection: () => void;
  /** Toggles between select all and an empty selection. */
  toggleSelectAll: () => void;
  /**
   * Toggles, replaces, or extends selection to the given key depending
   * on the pointer event and collection's selection mode.
   */
  select: (key: Key, e?: PressEvent | LongPressEvent | PointerEvent) => void;
  /** Returns whether the given key can be selected. */
  canSelectItem: (key: Key) => boolean;
  /** Returns whether the given key is non-interactive, i.e. both selection and actions are disabled. */
  isDisabled: (key: Key) => boolean;
  /** Sets the selection behavior for the collection. */
  setSelectionBehavior: (selectionBehavior: SelectionBehavior) => void;
  /** Returns whether the given key is a hyperlink. */
  isLink: (key: Key) => boolean;
} & FocusState;

export type MultipleSelectionStateProps = {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior;
  /** Whether onSelectionChange should fire even if the new set of keys is the same as the last. */
  allowDuplicateSelectionEvents?: boolean;
  /** Whether `disabledKeys` applies to all interactions, or only selection. */
  disabledBehavior?: DisabledBehavior;
} & MultipleSelection;
