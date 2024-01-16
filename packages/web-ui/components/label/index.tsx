import { createContext, forwardRef, type ReactElement } from "react";
import type {
  ContextValue,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
  SlotProps,
} from "types";
import { useContextProps } from "hooks";

export type LabelProps = PolymorphicComponentPropWithRef<
  "label" | "span",
  SlotProps
>;

export const LabelContext = createContext<
  ContextValue<LabelProps, HTMLLabelElement>
>({});

function Label(
  localprops: LabelProps,
  localref: PolymorphicRef<"label" | "span">
): ReactElement {
  const [props, ref] = useContextProps(localprops, localref, LabelContext);
  const { as: Component = "label", ...labelProps } = props;

  return <Component {...labelProps} ref={ref} />;
}

Label.displayName = "Label";

const _Label = /*#__PURE__*/ forwardRef(Label) as (
  props: LabelProps,
  ref: PolymorphicRef<"label" | "span">
) => ReactElement;
export { _Label as Label };
