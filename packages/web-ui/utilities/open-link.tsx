import type { ReactElement, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import type { LinkDOMProps } from "../types/shared/dom";
import { isFirefox, isIPad, isMac, isWebKit } from "./platform";
import { focusWithoutScrolling } from "./focus-without-scrolling";

type Router = {
  isNative: boolean;
  open: (target: Element, modifiers: Modifiers) => void;
};

const RouterContext = createContext<Router>({
  isNative: true,
  open: openSyntheticLink,
});

type RouterProviderProps = {
  navigate: (path: string) => void;
  children: ReactNode;
};

/**
 * A RouterProvider accepts a `navigate` function from a framework or client side router,
 * and provides it to all nested React Aria links to enable client side navigation.
 */
export function RouterProvider(props: RouterProviderProps): ReactElement {
  const { children, navigate } = props;

  const ctx = useMemo(
    () => ({
      isNative: false,
      open: (target: Element, modifiers: Modifiers) => {
        getSyntheticLink(target, (link) => {
          if (shouldClientNavigate(link, modifiers)) {
            navigate(link.pathname + link.search + link.hash);
          } else {
            openLink(link, modifiers);
          }
        });
      },
    }),
    [navigate]
  );

  return (
    <RouterContext.Provider value={ctx}>{children}</RouterContext.Provider>
  );
}

export function useRouter(): Router {
  return useContext(RouterContext);
}

type Modifiers = {
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

export function shouldClientNavigate(
  link: HTMLAnchorElement,
  modifiers: Modifiers
): boolean {
  // Use getAttribute here instead of link.target. Firefox will default link.target to "_parent" when inside an iframe.
  const target = link.getAttribute("target");
  return (
    (!target || target === "_self") &&
    link.origin === location.origin &&
    !link.hasAttribute("download") &&
    !modifiers.metaKey && // open in new tab (mac)
    !modifiers.ctrlKey && // open in new tab (windows)
    !modifiers.altKey && // download
    !modifiers.shiftKey
  );
}

export function openLink(
  target: HTMLAnchorElement,
  modifiers: Modifiers,
  setOpening = true
): void {
  let { metaKey, ctrlKey, altKey, shiftKey } = modifiers;

  // Firefox does not recognize keyboard events as a user action by default, and the popup blocker
  // will prevent links with target="_blank" from opening. However, it does allow the event if the
  // Command/Control key is held, which opens the link in a background tab. This seems like the best we can do.
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=257870 and https://bugzilla.mozilla.org/show_bug.cgi?id=746640.
  if (
    isFirefox() &&
    window.event?.type?.startsWith("key") &&
    target.target === "_blank"
  ) {
    if (isMac()) {
      metaKey = true;
    } else {
      ctrlKey = true;
    }
  }

  // WebKit does not support firing click events with modifier keys, but does support keyboard events.
  // https://github.com/WebKit/WebKit/blob/c03d0ac6e6db178f90923a0a63080b5ca210d25f/Source/WebCore/html/HTMLAnchorElement.cpp#L184
  const event =
    isWebKit() && isMac() && !isIPad() && process.env.NODE_ENV !== "test"
      ? new KeyboardEvent("keydown", {
          // @ts-expect-error - keyIdentifier is a non-standard property, but it's what webkit expects
          keyIdentifier: "Enter",
          metaKey,
          ctrlKey,
          altKey,
          shiftKey,
        })
      : new MouseEvent("click", {
          metaKey,
          ctrlKey,
          altKey,
          shiftKey,
          bubbles: true,
          cancelable: true,
        });
  (openLink as any).isOpening = setOpening;
  focusWithoutScrolling(target);
  target.dispatchEvent(event);
  (openLink as any).isOpening = false;
}
// https://github.com/parcel-bundler/parcel/issues/8724
(openLink as any).isOpening = false;

function getSyntheticLink(
  target: Element,
  open: (link: HTMLAnchorElement) => void
): void {
  if (target instanceof HTMLAnchorElement) {
    open(target);
  } else if (target.hasAttribute("data-href")) {
    const link = document.createElement("a");
    link.href = target.getAttribute("data-href")!;
    if (target.hasAttribute("data-target")) {
      link.target = target.getAttribute("data-target")!;
    }
    if (target.hasAttribute("data-rel")) {
      link.rel = target.getAttribute("data-rel")!;
    }
    if (target.hasAttribute("data-download")) {
      link.download = target.getAttribute("data-download")!;
    }
    if (target.hasAttribute("data-ping")) {
      link.ping = target.getAttribute("data-ping")!;
    }
    if (target.hasAttribute("data-referrer-policy")) {
      link.referrerPolicy = target.getAttribute("data-referrer-policy")!;
    }
    target.appendChild(link);
    open(link);
    target.removeChild(link);
  }
}

function openSyntheticLink(target: Element, modifiers: Modifiers) {
  getSyntheticLink(target, (link) => openLink(link, modifiers));
}

export function getSyntheticLinkProps(props: LinkDOMProps) {
  return {
    "data-href": props.href,
    "data-target": props.target,
    "data-rel": props.rel,
    "data-download": props.download,
    "data-ping": props.ping,
    "data-referrer-policy": props.referrerPolicy,
  };
}
