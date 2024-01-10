import type { AriaLabelingProps } from "../types/shared/a11y.js";
import type { DOMProps, LinkDOMProps } from "../types/shared/dom.js";

const DOMPropNames = new Set(["id"]);

const labelablePropNames = new Set([
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-details",
]);

// See LinkDOMProps in dom.d.ts.
const linkPropNames = new Set([
  "href",
  "target",
  "rel",
  "download",
  "ping",
  "referrerPolicy",
]);

type Options = {
  /**
   * If labelling associated aria properties should be included in the filter.
   */
  labelable?: boolean;
  /** Whether the element is a link and should include DOM props for <a> elements. */
  isLink?: boolean;
  /**
   * A Set of other property names that should be included in the filter.
   */
  propNames?: Set<string>;
};

const propRe = /(?:data-.*)/;

/**
 * Filters out all props that aren't valid DOM props or defined via override prop obj.
 * @param props - The component props to be filtered.
 * @param opts - Props to override.
 */
export function filterDOMProps(
  props: DOMProps & AriaLabelingProps & LinkDOMProps,
  opts: Options = {}
): DOMProps & AriaLabelingProps {
  const { labelable, isLink, propNames } = opts;
  const filteredProps: DOMProps & AriaLabelingProps = {};

  for (const prop in props) {
    if (
      Object.prototype.hasOwnProperty.call(props, prop) &&
      (DOMPropNames.has(prop) ||
        (labelable && labelablePropNames.has(prop)) ||
        (isLink && linkPropNames.has(prop)) ||
        propNames?.has(prop) ||
        propRe.test(prop))
    ) {
      filteredProps[prop as keyof (DOMProps & AriaLabelingProps)] =
        props[prop as keyof (DOMProps & AriaLabelingProps)];
    }
  }

  return filteredProps;
}
