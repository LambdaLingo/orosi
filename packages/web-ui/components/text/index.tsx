import type {
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
  SlotProps,
} from "types";
import { useContextProps } from "hooks";
import { type ForwardedRef, type ReactElement, forwardRef } from "react";
import { TextContext } from "store/text";

export type TextProps = PolymorphicComponentPropWithRef<
  "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  SlotProps
>;

function Text(
  localprops: TextProps,
  localref: PolymorphicRef<
    "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  >
): ReactElement {
  const [props, ref] = useContextProps(localprops, localref, TextContext);
  const { as: Component = "span", ...domProps } = props;
  return <Component {...domProps} ref={ref} />;
}

Text.displayName = "Text";
/**
 * Text represents text with no specific semantic meaning.
 */
const _Text = forwardRef(Text) as (
  props: TextProps,
  ref: ForwardedRef<HTMLElement>
) => ReactElement;
export { _Text as Text };
