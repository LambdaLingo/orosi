import type { FormValidationState, RACValidation } from "types/form";
import type { ListState } from "types/list";
import type { OverlayTriggerState } from "types/overlay";
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
