import {
  createContext,
  type ForwardedRef,
  type ReactElement,
  forwardRef,
  useContext,
  useRef,
} from "react";
import type {
  CheckboxGroupState,
  ContextValue,
  ForwardRefType,
  CheckboxGroupLocalProps,
  CheckboxLocalProps,
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
import { FieldErrorContext } from "../field-error";
import { LabelContext } from "../label";
import { TextContext } from "../text";
import { VisuallyHidden } from "../visually-hidden";
import { Provider } from "../provider";

export const CheckboxGroupContext =
  createContext<ContextValue<CheckboxGroupLocalProps, HTMLDivElement>>(null);
export const CheckboxGroupStateContext =
  createContext<CheckboxGroupState | null>(null);

function CheckboxGroup(
  localprops: CheckboxGroupLocalProps,
  localref: ForwardedRef<HTMLDivElement>
): ReactElement {
  const [props, ref] = useContextProps(
    localprops,
    localref,
    CheckboxGroupContext
  );
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
      data-disabled={props.isDisabled || undefined}
      data-invalid={state.isInvalid || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-required={props.isRequired || undefined}
      ref={ref}
      slot={props.slot || undefined}
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
  createContext<ContextValue<CheckboxLocalProps, HTMLLabelElement>>(null);

function Checkbox(
  localprops: CheckboxLocalProps,
  localref: ForwardedRef<HTMLLabelElement>
): ReactElement {
  const [props, ref] = useContextProps(localprops, localref, CheckboxContext);
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
        },
        // eslint-disable-next-line react-hooks/rules-of-hooks
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
      data-disabled={isDisabled || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focused={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-indeterminate={props.isIndeterminate || undefined}
      data-invalid={isInvalid || undefined}
      data-pressed={isPressed || undefined}
      data-readonly={isReadOnly || undefined}
      data-required={props.isRequired || undefined}
      data-selected={isSelected || undefined}
      ref={ref}
      slot={props.slot || undefined}
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
