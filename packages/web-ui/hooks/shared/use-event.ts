import { type RefObject, useEffect } from "react";
import { useEffectEvent } from "./use-effect-event";

export function useEvent<K extends keyof GlobalEventHandlersEventMap>(
  ref: RefObject<EventTarget>,
  event: K,
  handler?: (this: Document, ev: GlobalEventHandlersEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  const handleEvent = useEffectEvent(handler!);
  const isDisabled = handler === null;

  useEffect(() => {
    if (isDisabled) {
      return;
    }

    const element = ref.current;
    if (element) {
      const eventListener = handleEvent as EventListenerOrEventListenerObject;
      element.addEventListener(event, eventListener, options);
      return () => {
        element.removeEventListener(event, eventListener, options);
      };
    }
  }, [ref, event, options, isDisabled, handleEvent]);
}
