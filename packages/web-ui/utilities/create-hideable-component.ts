import React, { ReactNode, createContext, useContext } from "react";
import type { ForwardRefType } from "../types/shared/ref";
import ReactDOM from "react-dom";

export const HiddenContext = createContext<boolean>(false);

// Portal to nowhere
const hiddenFragment = typeof DocumentFragment !== 'undefined' ? new DocumentFragment() : null;

export function Hidden(props: {children: ReactNode}) {
  let isHidden = useContext(HiddenContext);
  let isSSR = useIsSSR();
  if (isHidden) {
    // Don't hide again if we are already hidden.
    return <>{props.children}</>;
  }

  let children = (
    <HiddenContext.Provider value>
      {props.children}
    </HiddenContext.Provider>
  );

  // In SSR, portals are not supported by React. Instead, render into a <template>
  // element, which the browser will never display to the user. In addition, the
  // content is not part of the DOM tree, so it won't affect ids or other accessibility attributes.
  return isSSR
    ? <template data-react-aria-hidden>{children}</template>
    : ReactDOM.createPortal(children, hiddenFragment!);
}

// Creates a component that forwards its ref and returns null if it is in a <Hidden> subtree.
// Note: this function is handled specially in the documentation generator. If you change it, you'll need to update DocsTransformer as well.
export function createHideableComponent<T, P = {}>(fn: (props: P, ref: React.Ref<T>) => React.ReactElement | null): (props: P & React.RefAttributes<T>) => React.ReactElement | null {
  let Wrapper = (props: P, ref: React.Ref<T>) => {
    let isHidden = useContext(HiddenContext);
    if (isHidden) {
      return null;
    }

    return fn(props, ref);
  };
  // @ts-ignore - for react dev tools
  Wrapper.displayName = fn.displayName || fn.name;
  return (React.forwardRef as ForwardRefType)(Wrapper);
}
