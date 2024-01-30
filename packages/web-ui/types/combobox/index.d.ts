import type { FormValidationState } from "types/form";
import type { SelectState } from "types/select";
import type {
  AriaLabelingProps,
  CollectionBase,
  CollectionStateBase,
  DOMProps,
  FocusStrategy,
  FocusableProps,
  HelpTextProps,
  InputBase,
  InputDOMProps,
  Key,
  LabelableProps,
  SingleSelection,
  TextInputBase,
  Validation,
} from "types/shared";

export type MenuTriggerAction = "focus" | "input" | "manual";

export type ComboBoxValidationValue = {
  /** The selected key in the ComboBox. */
  selectedKey: Key;
  /** The value of the ComboBox input. */
  inputValue: string;
};

export type ComboBoxProps<T> = {
  /** The list of ComboBox items (uncontrolled). */
  defaultItems?: Iterable<T>;
  /** The list of ComboBox items (controlled). */
  items?: Iterable<T>;
  /** Method that is called when the open state of the menu changes. Returns the new open state and the action that caused the opening of the menu. */
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void;
  /** The value of the ComboBox input (controlled). */
  inputValue?: string;
  /** The default value of the ComboBox input (uncontrolled). */
  defaultInputValue?: string;
  /** Handler that is called when the ComboBox input value changes. */
  onInputChange?: (value: string) => void;
  /** Whether the ComboBox allows a non-item matching input value to be set. */
  allowsCustomValue?: boolean;
  // /**
  //  * Whether the Combobox should only suggest matching options or autocomplete the field with the nearest matching option.
  //  * @default 'suggest'
  //  */
  // completionMode?: 'suggest' | 'complete',
  /**
   * The interaction required to display the ComboBox menu.
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction;
} & CollectionBase<T> &
  Omit<SingleSelection, "disallowEmptySelection"> &
  InputBase &
  TextInputBase &
  Validation<ComboBoxValidationValue> &
  FocusableProps<HTMLInputElement> &
  LabelableProps &
  HelpTextProps;

export type AriaComboBoxProps<T> = {
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean;
} & ComboBoxProps<T> &
  DOMProps &
  InputDOMProps &
  AriaLabelingProps;

export type ComboBoxState<T> = {
  /** The current value of the combo box input. */
  inputValue: string;
  /** Sets the value of the combo box input. */
  setInputValue: (value: string) => void;
  /** Selects the currently focused item and updates the input value. */
  commit: () => void;
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy;
  /** Opens the menu. */
  open: (
    focusStrategy?: FocusStrategy | null,
    trigger?: MenuTriggerAction
  ) => void;
  /** Toggles the menu. */
  toggle: (
    focusStrategy?: FocusStrategy | null,
    trigger?: MenuTriggerAction
  ) => void;
  /** Resets the input value to the previously selected item's text if any and closes the menu.  */
  revert: () => void;
} & SelectState<T> &
  FormValidationState;

type FilterFn = (textValue: string, inputValue: string) => boolean;

export type ComboBoxStateOptions<T> = {
  /** The filter function used to determine if a option should be included in the combo box list. */
  defaultFilter?: FilterFn;
  /** Whether the combo box allows the menu to be open when the collection is empty. */
  allowsEmptyCollection?: boolean;
  /** Whether the combo box menu should close on blur. */
  shouldCloseOnBlur?: boolean;
} & Omit<ComboBoxProps<T>, "children"> &
  CollectionStateBase<T>;
