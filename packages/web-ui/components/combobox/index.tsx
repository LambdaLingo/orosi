import React, {
  type ForwardedRef,
  type RefObject,
  createContext,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AriaComboBoxProps,
  ComboBoxState,
  ContextValue,
  ForwardRefType,
  RACValidation,
  Node,
  Collection,
  RenderChildren,
  SlotProps,
} from "types";
import {
  FieldErrorContext,
  GroupContext,
  InputContext,
  LabelContext,
  ListBoxContext,
  ListStateContext,
  OverlayTriggerStateContext,
  PopoverContext,
  TextContext,
  ButtonContext,
} from "store";
import {
  useComboBoxState,
  useComboBox,
  useFilter,
  useContextProps,
  useRenderChildren,
  useResizeObserver,
  useSlot,
} from "hooks";
import { removeDataAttributes, filterDOMProps } from "utilities";
import {
  CollectionDocumentContext,
  useCollectionDocument,
} from "components/collection";
import { Provider } from "components/provider";
import { Hidden } from "components/hidden";

export type ComboBoxRenderProps = {
  /**
   * Whether the combobox is currently open.
   * @selector [data-open]
   */
  isOpen: boolean;
  /**
   * Whether the combobox is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the combobox is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the combobox is required.
   * @selector [data-required]
   */
  isRequired: boolean;
};

export type ComboBoxProps<T extends object> = {
  /** The filter function used to determine if a option should be included in the combo box list. */
  defaultFilter?: (textValue: string, inputValue: string) => boolean;
  /**
   * Whether the text or key of the selected item is submitted as part of an HTML form.
   * When `allowsCustomValue` is `true`, this option does not apply and the text is always submitted.
   * @default 'key'
   */
  formValue?: "text" | "key";
} & Omit<
  AriaComboBoxProps<T>,
  | "children"
  | "placeholder"
  | "label"
  | "description"
  | "errorMessage"
  | "validationState"
  | "validationBehavior"
> &
  RACValidation &
  RenderChildren<ComboBoxRenderProps> &
  SlotProps;

export const ComboBoxContext =
  createContext<ContextValue<ComboBoxProps<any>, HTMLDivElement>>(null);
export const ComboBoxStateContext = createContext<ComboBoxState<any> | null>(
  null
);

function ComboBox<T extends object>(
  props: ComboBoxProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, ComboBoxContext);
  let { collection, document } = useCollectionDocument();
  let {
    children,
    isDisabled = false,
    isInvalid = false,
    isRequired = false,
  } = props;
  children = useMemo(
    () =>
      typeof children === "function"
        ? children({
            isOpen: false,
            isDisabled,
            isInvalid,
            isRequired,
          })
        : children,
    [children, isDisabled, isInvalid, isRequired]
  );

  return (
    <>
      {/* Render a hidden copy of the children so that we can build the collection even when the popover is not open.
       * This should always come before the real DOM content so we have built the collection by the time it renders during SSR. */}
      <Hidden>
        <Provider
          values={[
            [CollectionDocumentContext, document],
            [ListBoxContext, { items: props.items ?? props.defaultItems }],
          ]}
        >
          {children}
        </Provider>
      </Hidden>
      <ComboBoxInner props={props} collection={collection} comboBoxRef={ref} />
    </>
  );
}

type ComboBoxInnerProps<T extends object> = {
  props: ComboBoxProps<T>;
  collection: Collection<Node<T>>;
  comboBoxRef: RefObject<HTMLDivElement>;
};

function ComboBoxInner<T extends object>({
  props,
  collection,
  comboBoxRef: ref,
}: ComboBoxInnerProps<T>) {
  let { name, formValue = "key", allowsCustomValue } = props;
  if (allowsCustomValue) {
    formValue = "text";
  }

  let { contains } = useFilter({ sensitivity: "base" });
  let state = useComboBoxState({
    defaultFilter: props.defaultFilter || contains,
    ...props,
    // If props.items isn't provided, rely on collection filtering (aka listbox.items is provided or defaultItems provided to Combobox)
    items: props.items,
    children: undefined,
    collection,
    validationBehavior: props.validationBehavior ?? "native",
  });

  let buttonRef = useRef<HTMLButtonElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);
  let listBoxRef = useRef<HTMLDivElement>(null);
  let popoverRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();
  let {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    ...validation
  } = useComboBox(
    {
      ...removeDataAttributes(props),
      label,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
      name: formValue === "text" ? name : undefined,
      validationBehavior: props.validationBehavior ?? "native",
    },
    state
  );

  // Make menu width match input + button
  let [menuWidth, setMenuWidth] = useState<string | null>(null);
  let onResize = useCallback(() => {
    if (inputRef.current) {
      let buttonRect = buttonRef.current?.getBoundingClientRect();
      let inputRect = inputRef.current.getBoundingClientRect();
      let minX = buttonRect
        ? Math.min(buttonRect.left, inputRect.left)
        : inputRect.left;
      let maxX = buttonRect
        ? Math.max(buttonRect.right, inputRect.right)
        : inputRect.right;
      setMenuWidth(maxX - minX + "px");
    }
  }, [buttonRef, inputRef, setMenuWidth]);

  useResizeObserver({
    ref: inputRef,
    onResize: onResize,
  });

  // Only expose a subset of state to renderProps function to avoid infinite render loop
  let RenderChildrenState = useMemo(
    () => ({
      isOpen: state.isOpen,
      isDisabled: props.isDisabled || false,
      isInvalid: validation.isInvalid || false,
      isRequired: props.isRequired || false,
    }),
    [state.isOpen, props.isDisabled, validation.isInvalid, props.isRequired]
  );

  let RenderChildren = useRenderChildren({
    ...props,
    values: RenderChildrenState,
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [ComboBoxStateContext, state],
        [LabelContext, { ...labelProps, ref: labelRef }],
        [
          ButtonContext,
          { ...buttonProps, ref: buttonRef, isPressed: state.isOpen },
        ],
        [InputContext, { ...inputProps, ref: inputRef }],
        [OverlayTriggerStateContext, state],
        [
          PopoverContext,
          {
            ref: popoverRef,
            triggerRef: inputRef,
            placement: "bottom start",
            isNonModal: true,
            trigger: "ComboBox",
            style: { "--trigger-width": menuWidth } as React.CSSProperties,
          },
        ],
        [ListBoxContext, { ...listBoxProps, ref: listBoxRef }],
        [ListStateContext, state],
        [
          TextContext,
          {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps,
            },
          },
        ],
        [
          GroupContext,
          {
            isInvalid: validation.isInvalid,
            isDisabled: props.isDisabled || false,
          },
        ],
        [FieldErrorContext, validation],
      ]}
    >
      <div
        {...DOMProps}
        {...RenderChildren}
        ref={ref}
        slot={props.slot || undefined}
        data-focused={state.isFocused || undefined}
        data-open={state.isOpen || undefined}
        data-disabled={props.isDisabled || undefined}
        data-invalid={validation.isInvalid || undefined}
        data-required={props.isRequired || undefined}
      />
      {name && formValue === "key" && (
        <input type="hidden" name={name} value={state.selectedKey} />
      )}
    </Provider>
  );
}

/**
 * A combo box combines a text input with a listbox, allowing users to filter a list of options to items matching a query.
 */
const _ComboBox = /*#__PURE__*/ (forwardRef as ForwardRefType)(ComboBox);
export { _ComboBox as ComboBox };
