import type { AriaLabelingProps, ValidationErrors } from "types";
import type { FormEvent, FormHTMLAttributes } from "react";

export type FormProps = {
  /**
   * Validation errors for the form, typically returned by a server.
   * This should be set to an object mapping from input names to errors.
   */
  validationErrors?: ValidationErrors;
  /**
   * Where to send the form-data when the form is submitted.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#action).
   */
  action?: string | FormHTMLAttributes<HTMLFormElement>["action"];
  /**
   * The enctype attribute specifies how the form-data should be encoded when submitting it to the server.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#enctype).
   */
  encType?:
    | "application/x-www-form-urlencoded"
    | "multipart/form-data"
    | "text/plain";
  /**
   * The HTTP method to submit the form with.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#method).
   */
  method?: "get" | "post" | "dialog";
  /**
   * The target attribute specifies a name or a keyword that indicates where to display the response that is received after submitting the form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#target).
   */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /**
   * Triggered when a user submits the form.
   */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * Triggered when a user resets the form.
   */
  onReset?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * Triggered for each invalid field when a user submits the form.
   */
  onInvalid?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * Indicates whether input elements can by default have their values automatically completed by the browser.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#autocomplete).
   */
  autoComplete?: "off" | "on";
  /**
   * Controls whether inputted text is automatically capitalized and, if so, in what manner.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize).
   */
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
  /**
   * An ARIA role override to apply to the form element.
   */
  role?: "search" | "presentation";
} & AriaLabelingProps;
