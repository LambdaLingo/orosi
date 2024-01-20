import type {
  AriaLabelingProps,
  FocusableDOMProps,
  FocusableProps,
  InputBase,
  InputDOMProps,
} from "types";

type SwitchBase = {
  /**
   * The content to render as the Switch's label.
   */
  children?: ReactNode;
  /**
   * Whether the Switch should be selected (uncontrolled).
   */
  defaultSelected?: boolean;
  /**
   * Whether the Switch should be selected (controlled).
   */
  isSelected?: boolean;
  /**
   * Handler that is called when the Switch's selection state changes.
   */
  onChange?: (isSelected: boolean) => void;
  /**
   * The value of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string;
} & InputBase &
  FocusableProps;
export type SwitchProps = SwitchBase;
export type AriaSwitchBase = {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  "aria-controls"?: string;
} & SwitchBase &
  FocusableDOMProps &
  InputDOMProps &
  AriaLabelingProps;
export type AriaSwitchProps = SwitchProps & AriaSwitchBase;
