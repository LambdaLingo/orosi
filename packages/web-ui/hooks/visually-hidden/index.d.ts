import { type CSSProperties, useMemo, useState } from "react";
import { useFocusWithin } from "hooks/shared";

const styles: CSSProperties = {
  border: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
};

/**
 * Provides props for an element that hides its children visually
 * but keeps content visible to assistive technology.
 */
export function useVisuallyHidden(
  props: VisuallyHiddenProps = {}
): VisuallyHiddenAria {
  const { style, isFocusable } = props;

  const [isFocused, setFocused] = useState(false);
  const { focusWithinProps } = useFocusWithin({
    isDisabled: !isFocusable,
    onFocusWithinChange: (val) => setFocused(val),
  });

  // If focused, don't hide the element.
  const combinedStyles = useMemo(() => {
    if (isFocused) {
      return style;
    } else if (style) {
      return { ...styles, ...style };
    } else {
      return styles;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  return {
    visuallyHiddenProps: {
      ...focusWithinProps,
      style: combinedStyles,
    },
  };
}
