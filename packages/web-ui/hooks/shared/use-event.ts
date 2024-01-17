import { type RefObject, useEffect } from "react";
import { useEffectEvent } from "./use-effect-event";

export function useEvent<K extends keyof GlobalEventHandlersEventMap>(
  ref: RefObject<EventTarget>,
  event: K,
  handler?: (this: Document, ev: GlobalEventHandlersEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  let handleEvent = useEffectEvent(handler);
  let isDisabled = handler == null;

  useEffect(() => {
    if (isDisabled) {
      return;
    }

    let element = ref.current;
    element.addEventListener(event, handleEvent, options);
    return () => {
      element.removeEventListener(event, handleEvent, options);
    };
  }, [ref, event, options, isDisabled, handleEvent]);
}
