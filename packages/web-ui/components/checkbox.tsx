import {
  createContext,
  type ForwardedRef,
  forwardRef,
  useContext,
  useRef,
} from "react";
import type {
  AriaCheckboxGroupProps,
  AriaCheckboxProps,
  HoverEvents,
  CheckboxGroupState,
  RACValidation,
  RenderChildren,
  SlotProps,
  ContextValue,
  ForwardRefType,
} from "types";
import {
  useCheckbox,
  useCheckboxGroup,
  useCheckboxGroupItem,
  useFocusRing,
  useHover,
  useCheckboxGroupState,
  useToggleState,
  useContextProps,
  useRenderChildren,
  useSlot,
} from "hooks";
import { mergeProps, filterDOMProps } from "utilities";
import { FieldErrorContext } from "./field-error";
import { LabelContext } from "./label";
import { TextContext } from "./text";
import { VisuallyHidden } from "./visually-hidden";
import { Provider } from "./provider";

export type CheckboxGroupProps = Omit<
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
export type CheckboxProps = Omit<
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

export const CheckboxGroupContext =
  createContext<ContextValue<CheckboxGroupProps, HTMLDivElement>>(null);
export const CheckboxGroupStateContext =
  createContext<CheckboxGroupState | null>(null);

function CheckboxGroup(
  props: CheckboxGroupProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, CheckboxGroupContext);
  const state = useCheckboxGroupState({
    ...props,
    validationBehavior: props.validationBehavior ?? "native",
  });
  const [labelRef, label] = useSlot();
  const {
    groupProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useCheckboxGroup(
    {
      ...props,
      label,
      validationBehavior: props.validationBehavior ?? "native",
    },
    state
  );

  const RenderChildren = useRenderChildren({
    ...props,
    values: {
      isDisabled: state.isDisabled,
      isReadOnly: state.isReadOnly,
      isRequired: props.isRequired || false,
      isInvalid: state.isInvalid,
      state,
    },
  });

  return (
    <div
      {...groupProps}
      {...RenderChildren}
      ref={ref}
      slot={props.slot || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-required={props.isRequired || undefined}
      data-invalid={state.isInvalid || undefined}
      data-disabled={props.isDisabled || undefined}
    >
      <Provider
        values={[
          [CheckboxGroupStateContext, state],
          [LabelContext, { ...labelProps, ref: labelRef, elementType: "span" }],
          [
            TextContext,
            {
              slots: {
                description: descriptionProps,
                errorMessage: errorMessageProps,
              },
            },
          ],
          [FieldErrorContext, validation],
        ]}
      >
        {RenderChildren.children}
      </Provider>
    </div>
  );
}

export const CheckboxContext =
  createContext<ContextValue<CheckboxProps, HTMLLabelElement>>(null);

function Checkbox(props: CheckboxProps, ref: ForwardedRef<HTMLLabelElement>) {
  [props, ref] = useContextProps(props, ref, CheckboxContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const groupState = useContext(CheckboxGroupStateContext);
  const {
    labelProps,
    inputProps,
    isSelected,
    isDisabled,
    isReadOnly,
    isPressed,
    isInvalid,
  } = groupState
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useCheckboxGroupItem(
        {
          ...props,
          // Value is optional for standalone checkboxes, but required for CheckboxGroup items;
          // it's passed explicitly here to avoid typescript error (requires ignore).
          // @ts-ignore
          value: props.value,
          // ReactNode type doesn't allow function children.
          children:
            typeof props.children === "function" ? true : props.children,
        },
        groupState,
        inputRef
      )
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useCheckbox(
        {
          ...props,
          children:
            typeof props.children === "function" ? true : props.children,
          validationBehavior: props.validationBehavior ?? "native",
          // eslint-disable-next-line react-hooks/rules-of-hooks
        },
        useToggleState(props),
        inputRef
      );
  const { isFocused, isFocusVisible, focusProps } = useFocusRing();
  const isInteractionDisabled = isDisabled || isReadOnly;

  const { hoverProps, isHovered } = useHover({
    ...props,
    isDisabled: isInteractionDisabled,
  });

  const RenderChildren = useRenderChildren({
    // TODO: should data attrs go on the label or on the <input>? useCheckbox passes them to the input...
    ...props,
    values: {
      isSelected,
      isIndeterminate: props.isIndeterminate || false,
      isPressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly,
      isInvalid,
      isRequired: props.isRequired || false,
    },
  });

  const DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <label
      {...mergeProps(DOMProps, labelProps, hoverProps, RenderChildren)}
      ref={ref}
      slot={props.slot || undefined}
      data-selected={isSelected || undefined}
      data-indeterminate={props.isIndeterminate || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-invalid={isInvalid || undefined}
      data-required={props.isRequired || undefined}
    >
      <VisuallyHidden elementType="span">
        <input {...inputProps} {...focusProps} ref={inputRef} />
      </VisuallyHidden>
      {RenderChildren.children}
    </label>
  );
}

/**
 * A checkbox allows a user to select multiple items from a list of individual items, or
 * to mark one individual item as selected.
 */
const _Checkbox = /*#__PURE__*/ (forwardRef as ForwardRefType)(Checkbox);

/**
 * A checkbox group allows a user to select multiple items from a list of options.
 */
const _CheckboxGroup = /*#__PURE__*/ (forwardRef as ForwardRefType)(
  CheckboxGroup
);

export { _Checkbox as Checkbox, _CheckboxGroup as CheckboxGroup };
