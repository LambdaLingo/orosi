import { useCallback, useEffect, useRef } from "react";

interface GlobalListeners {
  addGlobalListener<K extends keyof DocumentEventMap>(
    el: EventTarget,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addGlobalListener(
    el: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeGlobalListener<K extends keyof DocumentEventMap>(
    el: EventTarget,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeGlobalListener(
    el: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  removeAllGlobalListeners(): void;
}

export function useGlobalListeners(): GlobalListeners {
  let globalListeners = useRef(new Map());
  let addGlobalListener = useCallback(
    (eventTarget, type, listener, options) => {
      // Make sure we remove the listener after it is called with the `once` option.
      let fn = options?.once
        ? (...args) => {
            globalListeners.current.delete(listener);
            listener(...args);
          }
        : listener;
      globalListeners.current.set(listener, { type, eventTarget, fn, options });
      eventTarget.addEventListener(type, listener, options);
    },
    []
  );
  let removeGlobalListener = useCallback(
    (eventTarget, type, listener, options) => {
      let fn = globalListeners.current.get(listener)?.fn || listener;
      eventTarget.removeEventListener(type, fn, options);
      globalListeners.current.delete(listener);
    },
    []
  );
  let removeAllGlobalListeners = useCallback(() => {
    globalListeners.current.forEach((value, key) => {
      removeGlobalListener(value.eventTarget, value.type, key, value.options);
    });
  }, [removeGlobalListener]);

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return removeAllGlobalListeners;
  }, [removeAllGlobalListeners]);

  return { addGlobalListener, removeGlobalListener, removeAllGlobalListeners };
}
