import type {
  AriaLabelingProps,
  AriaToggleProps,
  AriaValidationProps,
  DOMProps,
  FormValidationState,
  HelpTextProps,
  HoverEvents,
  InputBase,
  InputDOMProps,
  LabelableProps,
  RACValidation,
  RenderChildren,
  SlotProps,
  ToggleProps,
  Validation,
  ValidationState,
  ValueBase,
} from "types";

export type CheckboxGroupProps = ValueBase<string[]> &
  InputBase &
  InputDOMProps &
  LabelableProps &
  HelpTextProps &
  Validation<string[]>;

export type CheckboxProps = {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean;
} & ToggleProps;

export type AriaCheckboxProps = CheckboxProps & AriaToggleProps;

export type AriaCheckboxGroupProps = CheckboxGroupProps &
  DOMProps &
  AriaLabelingProps &
  AriaValidationProps;

export type AriaCheckboxGroupItemProps = {
  value: string;
} & Omit<AriaCheckboxProps, "isSelected" | "defaultSelected">;

export type CheckboxGroupState = {
  /** Current selected values. */
  readonly value: readonly string[];

  /** Whether the checkbox group is disabled. */
  readonly isDisabled: boolean;

  /** Whether the checkbox group is read only. */
  readonly isReadOnly: boolean;

  /**
   * The current validation state of the checkbox group.
   * @deprecated Use `isInvalid` instead.
   */
  readonly validationState: ValidationState | null;

  /** Whether the checkbox group is invalid. */
  readonly isInvalid: boolean;

  /**
   * Whether the checkboxes in the group are required.
   * This changes to false once at least one item is selected.
   */
  readonly isRequired: boolean;

  /** Returns whether the given value is selected. */
  isSelected: (value: string) => boolean;

  /** Sets the selected values. */
  setValue: (value: string[]) => void;

  /** Adds a value to the set of selected values. */
  addValue: (value: string) => void;

  /** Removes a value from the set of selected values. */
  removeValue: (value: string) => void;

  /** Toggles a value in the set of selected values. */
  toggleValue: (value: string) => void;

  /** Sets whether one of the checkboxes is invalid. */
  setInvalid: (value: string, validation: ValidationResult) => void;
} & FormValidationState;

export type CheckboxGroupLocalProps = Omit<
  AriaCheckboxGroupProps,
  | "children"
  | "label"
  | "description"
  | "errorMessage"
  | "validationState"
  | "validationBehavior"
> &
  RACValidation &
  RenderChildren<CheckboxGroupRenderProps> &
  SlotProps;
export type CheckboxLocalProps = Omit<
  AriaCheckboxProps,
  "children" | "validationState" | "validationBehavior"
> &
  HoverEvents &
  RACValidation &
  RenderChildren<CheckboxRenderProps> &
  SlotProps;

export type CheckboxGroupRenderProps = {
  /**
   * Whether the checkbox group is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the checkbox group is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * Whether the checkbox group is required.
   * @selector [data-required]
   */
  isRequired: boolean;
  /**
   * Whether the checkbox group is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * State of the checkbox group.
   */
  state: CheckboxGroupState;
};

export type CheckboxRenderProps = {
  /**
   * Whether the checkbox is selected.
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the checkbox is indeterminate.
   * @selector [data-indeterminate]
   */
  isIndeterminate: boolean;
  /**
   * Whether the checkbox is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the checkbox is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the checkbox is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the checkbox is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the checkbox is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the checkbox is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * Whether the checkbox invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the checkbox is required.
   * @selector [data-required]
   */
  isRequired: boolean;
};
