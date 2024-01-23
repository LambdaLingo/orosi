import { useCallback, useEffect, useRef } from "react";

type GlobalListeners = {
  addGlobalListener: (<K extends keyof DocumentEventMap>(
    el: EventTarget,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => void) &
    ((
      el: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) => void);
  removeGlobalListener: (<K extends keyof DocumentEventMap>(
    el: EventTarget,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ) => void) &
    ((
      el: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ) => void);
  removeAllGlobalListeners: () => void;
};

export function useGlobalListeners(): GlobalListeners {
  const globalListeners = useRef(new Map());
  const addGlobalListener = useCallback(
    // @ts-expect-error - review this later
    (eventTarget, type, listener, options) => {
      // Make sure we remove the listener after it is called with the `once` option.
      const fn = options?.once
        ? // @ts-expect-error - review this later
          (...args) => {
            globalListeners.current.delete(listener);
            listener(...args);
          }
        : listener;
      globalListeners.current.set(listener, { type, eventTarget, fn, options });
      eventTarget.addEventListener(type, listener, options);
    },
    []
  );
  const removeGlobalListener = useCallback(
    // @ts-expect-error - review this later
    (eventTarget, type, listener, options) => {
      const fn = globalListeners.current.get(listener)?.fn || listener;
      eventTarget.removeEventListener(type, fn, options);
      globalListeners.current.delete(listener);
    },
    []
  );
  const removeAllGlobalListeners = useCallback(() => {
    globalListeners.current.forEach((value, key) => {
      removeGlobalListener(value.eventTarget, value.type, key, value.options);
    });
  }, [removeGlobalListener]);

  useEffect(() => {
    return removeAllGlobalListeners;
  }, [removeAllGlobalListeners]);

  return { addGlobalListener, removeGlobalListener, removeAllGlobalListeners };
}
