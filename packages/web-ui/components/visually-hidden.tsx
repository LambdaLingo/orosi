import type { ReactElement } from "react";
import type { VisuallyHiddenProps } from "types";
import { useVisuallyHidden } from "hooks";
import { mergeProps } from "utilities";

/**
 * VisuallyHidden hides its children visually, while keeping content visible
 * to screen readers.
 */
export function VisuallyHidden(props: VisuallyHiddenProps): ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    children,
    elementType: Element = "div",
    isFocusable,
    style,
    ...otherProps
  } = props;
  const { visuallyHiddenProps } = useVisuallyHidden(props);

  return (
    <Element {...mergeProps(otherProps, visuallyHiddenProps)}>
      {children}
    </Element>
  );
}
