import type { AriaLabelingProps } from "../shared/a11y";
import type { RenderChildren, isDisabledProp } from "../shared/component";
import type { SlotProps } from "../shared/context";
import type { FocusableDOMProps } from "../shared/dom";
import type {
  FocusEvents,
  HoverEvents,
  KeyboardEvents,
  PressEvents,
} from "../shared/events";

export type ButtonUIStates = {
  /**
   * Whether the button is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the button is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the button is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the button is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the button is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
};

export type ButtonEventProps = HoverEvents &
  PressEvents &
  KeyboardEvents &
  FocusEvents;

export type ButtonAriaProps = AriaLabelingProps & {
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  "aria-expanded"?: boolean | "true" | "false";
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  "aria-haspopup"?:
    | boolean
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog"
    | "true"
    | "false";
  /** Identifies the element (or elements) whose contents or presence are controlled by the current element. */
  "aria-controls"?: string;
  /** Indicates the current "pressed" state of toggle buttons. */
  "aria-pressed"?: boolean | "true" | "false" | "mixed";
  /**
   * The behavior of the button when used in an HTML form.
   * @defaultValue `button`
   */
  type?: "button" | "submit" | "reset";
};

export type ButtonDOMProps = FocusableDOMProps &
  RenderChildren<ButtonUIStates> &
  isDisabledProp;

export type ButtonLayoutProps = SlotProps;

export type ButtonProps = ButtonDOMProps &
  ButtonEventProps &
  ButtonAriaProps &
  ButtonLayoutProps & {
    /**
     * The <form> element to associate the button with.
     * The value of this attribute must be the id of a <form> in the same document.
     */
    form?: string;
    /**
     * The URL that processes the information submitted by the button.
     * Overrides the action attribute of the button's form owner.
     */
    formAction?: string;
    /** Indicates how to encode the form data that is submitted. */
    formEncType?: string;
    /** Indicates the HTTP method used to submit the form. */
    formMethod?: string;
    /** Indicates that the form is not to be validated when it is submitted. */
    formNoValidate?: boolean;
    /** Overrides the target attribute of the button's form owner. */
    formTarget?: string;
    /** Submitted as a pair with the button's value as part of the form data. */
    name?: string;
    /** The value associated with the button's name when it's submitted with the form data. */
    value?: string;
    /** Whether the target should not receive focus on press. */
    preventFocusOnPress?: boolean;
    /** Whether text selection should be enabled on the pressable element. */
    allowFocusWhenDisabled?: boolean;
  };

export type ButtonContextValue = ButtonProps & {
  isPressed?: boolean;
};
