import React, {
  type ForwardedRef,
  createContext,
  forwardRef,
  useRef,
} from "react";
import type {
  AriaRadioGroupProps,
  AriaRadioProps,
  RadioGroupState,
  HoverEvents,
  Orientation,
  ContextValue,
  ForwardRefType,
  RACValidation,
  RenderChildren,
  SlotProps,
} from "types";
import { FieldErrorContext, LabelContext, TextContext } from "store";
import {
  useFocusRing,
  useHover,
  useRadio,
  useRadioGroup,
  useContextProps,
  useRenderChildren,
  useSlot,
  useRadioGroupState,
} from "hooks";
import { filterDOMProps, mergeProps, removeDataAttributes } from "utilities";
import { Provider } from "components/provider";
import { VisuallyHidden } from "components/visually-hidden";

export type RadioGroupProps = {} & Omit<
  AriaRadioGroupProps,
  | "children"
  | "label"
  | "description"
  | "errorMessage"
  | "validationState"
  | "validationBehavior"
> &
  RACValidation &
  RenderChildren<RadioGroupRenderProps> &
  SlotProps;
export type RadioProps = Omit<AriaRadioProps, "children"> &
  HoverEvents &
  RenderChildren<RadioRenderProps> &
  SlotProps;

export type RadioGroupRenderProps = {
  /**
   * The orientation of the radio group.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation;
  /**
   * Whether the radio group is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the radio group is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * Whether the radio group is required.
   * @selector [data-required]
   */
  isRequired: boolean;
  /**
   * Whether the radio group is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * State of the radio group.
   */
  state: RadioGroupState;
};

export type RadioRenderProps = {
  /**
   * Whether the radio is selected.
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the radio is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the radio is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the radio is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the radio is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the radio is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the radio is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * Whether the radio is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the checkbox is required.
   * @selector [data-required]
   */
  isRequired: boolean;
};

export const RadioGroupContext =
  createContext<ContextValue<RadioGroupProps, HTMLDivElement>>(null);
export const RadioContext =
  createContext<ContextValue<Partial<RadioProps>, HTMLLabelElement>>(null);
export const RadioGroupStateContext = createContext<RadioGroupState | null>(
  null
);

function RadioGroup(props: RadioGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, RadioGroupContext);
  let state = useRadioGroupState({
    ...props,
    validationBehavior: props.validationBehavior ?? "native",
  });

  let [labelRef, label] = useSlot();
  let {
    radioGroupProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useRadioGroup(
    {
      ...props,
      label,
      validationBehavior: props.validationBehavior ?? "native",
    },
    state
  );

  let RenderChildren = useRenderChildren({
    ...props,
    values: {
      orientation: props.orientation || "vertical",
      isDisabled: state.isDisabled,
      isReadOnly: state.isReadOnly,
      isRequired: state.isRequired,
      isInvalid: state.isInvalid,
      state,
    },
  });

  return (
    <div
      {...radioGroupProps}
      {...RenderChildren}
      ref={ref}
      slot={props.slot || undefined}
      data-orientation={props.orientation || "vertical"}
      data-invalid={state.isInvalid || undefined}
      data-disabled={state.isDisabled || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-required={state.isRequired || undefined}
    >
      <Provider
        values={[
          [RadioGroupStateContext, state],
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

function Radio(props: RadioProps, ref: ForwardedRef<HTMLLabelElement>) {
  [props, ref] = useContextProps(props, ref, RadioContext);
  let state = React.useContext(RadioGroupStateContext)!;
  let inputRef = useRef<HTMLInputElement>(null);
  let { labelProps, inputProps, isSelected, isDisabled, isPressed } = useRadio(
    {
      ...removeDataAttributes<RadioProps>(props),
      // ReactNode type doesn't allow function children.
      children: typeof props.children === "function" ? true : props.children,
    },
    state,
    inputRef
  );
  let { isFocused, isFocusVisible, focusProps } = useFocusRing();
  let interactionDisabled = isDisabled || state.isReadOnly;

  let { hoverProps, isHovered } = useHover({
    ...props,
    isDisabled: interactionDisabled,
  });

  let RenderChildren = useRenderChildren({
    ...props,
    values: {
      isSelected,
      isPressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly: state.isReadOnly,
      isInvalid: state.isInvalid,
      isRequired: state.isRequired,
    },
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <label
      {...mergeProps(DOMProps, labelProps, hoverProps, RenderChildren)}
      ref={ref}
      data-selected={isSelected || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-invalid={state.isInvalid || undefined}
      data-required={state.isRequired || undefined}
    >
      <VisuallyHidden elementType="span">
        <input {...mergeProps(inputProps, focusProps)} ref={inputRef} />
      </VisuallyHidden>
      {RenderChildren.children}
    </label>
  );
}

/**
 * A radio group allows a user to select a single item from a list of mutually exclusive options.
 */
const _RadioGroup = /*#__PURE__*/ (forwardRef as ForwardRefType)(RadioGroup);

/**
 * A radio represents an individual option within a radio group.
 */
const _Radio = /*#__PURE__*/ (forwardRef as ForwardRefType)(Radio);

export { _RadioGroup as RadioGroup, _Radio as Radio };
