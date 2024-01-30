import { useContext, type ReactNode, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { useIsSSR } from "hooks";
import { HiddenContext, hiddenFragment } from "store";

export function Hidden(props: { children: ReactNode }): ReactElement {
  const isHidden = useContext(HiddenContext);
  const isSSR = useIsSSR();
  if (isHidden) {
    // Don't hide again if we are already hidden.
    return <>{props.children}</>;
  }

  const children = (
    <HiddenContext.Provider value>{props.children}</HiddenContext.Provider>
  );

  // In SSR, portals are not supported by React. Instead, render into a <template>
  // element, which the browser will never display to the user. In addition, the
  // content is not part of the DOM tree, so it won't affect ids or other accessibility attributes.
  return isSSR ? (
    <template data-react-aria-hidden>{children}</template>
  ) : (
    createPortal(children, hiddenFragment!)
  );
}
