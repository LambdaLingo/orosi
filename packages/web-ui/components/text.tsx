import type {
  ContextValue,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
  SlotProps,
} from "types";
import { useContextProps } from "hooks";
import {
  type ForwardedRef,
  type ReactElement,
  createContext,
  forwardRef,
} from "react";

export type TextProps = PolymorphicComponentPropWithRef<
  "span" | "p",
  SlotProps
>;

export const TextContext = createContext<ContextValue<TextProps, HTMLElement>>(
  {}
);

function Text(
  localprops: TextProps,
  localref: PolymorphicRef<"span" | "p">
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
