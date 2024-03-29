import {
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  PointerType,
  PressProps,
  PressEvent as IPressEvent,
  DOMAttributes,
  FocusableElement,
} from "types";
import { PressResponderContext } from "store";
import {
  mergeProps,
  focusWithoutScrolling,
  getOwnerDocument,
  getOwnerWindow,
  isMac,
  isVirtualClick,
  isVirtualPointerEvent,
  openLink,
  disableTextSelection,
  restoreTextSelection,
} from "utilities";
import { useEffectEvent, useGlobalListeners, useSyncRef } from "hooks/shared";

export type PressHookProps = {
  /** A ref to the target element. */
  ref?: RefObject<Element>;
} & PressProps;

type PressState = {
  isPressed: boolean;
  ignoreEmulatedMouseEvents: boolean;
  ignoreClickAfterPress: boolean;
  didFirePressStart: boolean;
  isTriggeringEvent: boolean;
  activePointerId: any;
  target: FocusableElement | null;
  isOverTarget: boolean;
  pointerType: PointerType | null;
  userSelect?: string;
  metaKeyEvents?: Map<string, KeyboardEvent>;
};

type EventBase = {
  currentTarget: EventTarget | null;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
};

export type PressResult = {
  /** Whether the target is currently pressed. */
  isPressed: boolean;
  /** Props to spread on the target element. */
  pressProps: DOMAttributes;
};

type PressKeyboardEvent = {
  [LINK_CLICKED]?: boolean;
} & KeyboardEvent;

function usePressResponderContext(props: PressHookProps): PressHookProps {
  // Consume context from <PressResponder> and merge with props.
  const context = useContext(PressResponderContext);
  if (context) {
    const { register, ...contextProps } = context;
    props = mergeProps(contextProps, props) as PressHookProps;
    register();
  }
  useSyncRef(context, props.ref);

  return props;
}

class PressEvent implements IPressEvent {
  type: IPressEvent["type"];
  pointerType: PointerType;
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  #shouldStopPropagation = true;

  constructor(
    type: IPressEvent["type"],
    pointerType: PointerType,
    originalEvent: EventBase
  ) {
    this.type = type;
    this.pointerType = pointerType;
    this.target = originalEvent.currentTarget as Element;
    this.shiftKey = originalEvent.shiftKey;
    this.metaKey = originalEvent.metaKey;
    this.ctrlKey = originalEvent.ctrlKey;
    this.altKey = originalEvent.altKey;
  }

  continuePropagation(): void {
    this.#shouldStopPropagation = false;
  }

  get shouldStopPropagation(): boolean {
    return this.#shouldStopPropagation;
  }
}

const LINK_CLICKED = Symbol("linkClicked");

/**
 * Handles press interactions across mouse, touch, keyboard, and screen readers.
 * It normalizes behavior across browsers and platforms, and handles many nuances
 * of dealing with pointer and keyboard events.
 */
export function usePress(props: PressHookProps): PressResult {
  const {
    onPress,
    onPressChange,
    onPressStart,
    onPressEnd,
    onPressUp,
    isDisabled,
    isPressed: isPressedProp,
    preventFocusOnPress,
    shouldCancelOnPointerExit,
    allowTextSelectionOnPress,
    ref: _, // Removing `ref` from `domProps` because TypeScript is dumb
    ...domProps
  } = usePressResponderContext(props);

  const [isPressed, setIsPressed] = useState(false);
  const ref = useRef<PressState>({
    isPressed: false,
    ignoreEmulatedMouseEvents: false,
    ignoreClickAfterPress: false,
    didFirePressStart: false,
    isTriggeringEvent: false,
    activePointerId: null,
    target: null,
    isOverTarget: false,
    pointerType: null,
  });

  const { addGlobalListener, removeAllGlobalListeners } = useGlobalListeners();

  const triggerPressStart = useEffectEvent(
    (originalEvent: EventBase, pointerType: PointerType) => {
      const state = ref.current;
      if (isDisabled || state.didFirePressStart) {
        return false;
      }

      let shouldStopPropagation = true;
      state.isTriggeringEvent = true;
      if (onPressStart) {
        const event = new PressEvent("pressstart", pointerType, originalEvent);
        onPressStart(event);
        shouldStopPropagation = event.shouldStopPropagation;
      }

      if (onPressChange) {
        onPressChange(true);
      }

      state.isTriggeringEvent = false;
      state.didFirePressStart = true;
      setIsPressed(true);
      return shouldStopPropagation;
    }
  );

  const triggerPressEnd = useEffectEvent(
    (originalEvent: EventBase, pointerType: PointerType, wasPressed = true) => {
      const state = ref.current;
      if (!state.didFirePressStart) {
        return false;
      }

      state.ignoreClickAfterPress = true;
      state.didFirePressStart = false;
      state.isTriggeringEvent = true;

      let shouldStopPropagation = true;
      if (onPressEnd) {
        const event = new PressEvent("pressend", pointerType, originalEvent);
        onPressEnd(event);
        shouldStopPropagation = event.shouldStopPropagation;
      }

      if (onPressChange) {
        onPressChange(false);
      }

      setIsPressed(false);

      if (onPress && wasPressed && !isDisabled) {
        const event = new PressEvent("press", pointerType, originalEvent);
        onPress(event);
        shouldStopPropagation &&= event.shouldStopPropagation;
      }

      state.isTriggeringEvent = false;
      return shouldStopPropagation;
    }
  );

  const triggerPressUp = useEffectEvent(
    (originalEvent: EventBase, pointerType: PointerType) => {
      const state = ref.current;
      if (isDisabled) {
        return false;
      }

      if (onPressUp) {
        state.isTriggeringEvent = true;
        const event = new PressEvent("pressup", pointerType, originalEvent);
        onPressUp(event);
        state.isTriggeringEvent = false;
        return event.shouldStopPropagation;
      }

      return true;
    }
  );

  const cancel = useEffectEvent((e: EventBase) => {
    const state = ref.current;
    if (state.isPressed && state.target) {
      if (state.isOverTarget && state.pointerType !== null) {
        triggerPressEnd(createEvent(state.target, e), state.pointerType, false);
      }
      state.isPressed = false;
      state.isOverTarget = false;
      state.activePointerId = null;
      state.pointerType = null;
      removeAllGlobalListeners();
      if (!allowTextSelectionOnPress) {
        restoreTextSelection(state.target);
      }
    }
  });

  const cancelOnPointerExit = useEffectEvent((e: EventBase) => {
    if (shouldCancelOnPointerExit) {
      cancel(e);
    }
  });

  const pressProps = useMemo(() => {
    const state = ref.current;
    const pressProps: DOMAttributes = {
      onKeyDown(e) {
        if (
          isValidKeyboardEvent(e.nativeEvent, e.currentTarget) &&
          e.currentTarget.contains(e.target as Element)
        ) {
          if (shouldPreventDefaultKeyboard(e.target as Element, e.key)) {
            e.preventDefault();
          }

          // If the event is repeating, it may have started on a different element
          // after which focus moved to the current element. Ignore these events and
          // only handle the first key down event.
          let shouldStopPropagation = true;
          if (!state.isPressed && !e.repeat) {
            state.target = e.currentTarget;
            state.isPressed = true;
            shouldStopPropagation = triggerPressStart(e, "keyboard");

            // Focus may move before the key up event, so register the event on the document
            // instead of the same element where the key down event occurred.
            addGlobalListener(
              getOwnerDocument(e.currentTarget),
              "keyup",
              onKeyUp,
              false
            );
          }

          if (shouldStopPropagation) {
            e.stopPropagation();
          }

          // Keep track of the keydown events that occur while the Meta (e.g. Command) key is held.
          // macOS has a bug where keyup events are not fired while the Meta key is down.
          // When the Meta key itself is released we will get an event for that, and we'll act as if
          // all of these other keys were released as well.
          // https://bugs.chromium.org/p/chromium/issues/detail?id=1393524
          // https://bugs.webkit.org/show_bug.cgi?id=55291
          // https://bugzilla.mozilla.org/show_bug.cgi?id=1299553
          if (e.metaKey && isMac()) {
            state.metaKeyEvents?.set(e.key, e.nativeEvent);
          }
        } else if (e.key === "Meta") {
          state.metaKeyEvents = new Map();
        }
      },
      onKeyUp(e) {
        if (
          isValidKeyboardEvent(e.nativeEvent, e.currentTarget) &&
          !e.repeat &&
          e.currentTarget.contains(e.target as Element) &&
          state.target
        ) {
          triggerPressUp(createEvent(state.target, e), "keyboard");
        }
      },
      onClick(e) {
        if (e && !e.currentTarget.contains(e.target as Element)) {
          return;
        }

        if (
          e &&
          e.button === 0 &&
          !state.isTriggeringEvent &&
          !(openLink as any).isOpening
        ) {
          let shouldStopPropagation = true;
          if (isDisabled) {
            e.preventDefault();
          }

          // If triggered from a screen reader or by using element.click(),
          // trigger as if it were a keyboard click.
          if (
            !state.ignoreClickAfterPress &&
            !state.ignoreEmulatedMouseEvents &&
            !state.isPressed &&
            (state.pointerType === "virtual" || isVirtualClick(e.nativeEvent))
          ) {
            // Ensure the element receives focus (VoiceOver on iOS does not do this)
            if (!isDisabled && !preventFocusOnPress) {
              focusWithoutScrolling(e.currentTarget);
            }

            const stopPressStart = triggerPressStart(e, "virtual");
            const stopPressUp = triggerPressUp(e, "virtual");
            const stopPressEnd = triggerPressEnd(e, "virtual");
            shouldStopPropagation =
              stopPressStart && stopPressUp && stopPressEnd;
          }

          state.ignoreEmulatedMouseEvents = false;
          state.ignoreClickAfterPress = false;
          if (shouldStopPropagation) {
            e.stopPropagation();
          }
        }
      },
    };

    const onKeyUp = (e: PressKeyboardEvent): void => {
      if (
        state.isPressed &&
        state.target &&
        isValidKeyboardEvent(e, state.target)
      ) {
        if (shouldPreventDefaultKeyboard(e.target as Element, e.key)) {
          e.preventDefault();
        }

        const target = e.target as Element;
        const shouldStopPropagation = triggerPressEnd(
          createEvent(state.target, e),
          "keyboard",
          state.target.contains(target)
        );
        removeAllGlobalListeners();

        if (shouldStopPropagation) {
          e.stopPropagation();
        }

        // If a link was triggered with a key other than Enter, open the URL ourselves.
        // This means the link has a role override, and the default browser behavior
        // only applies when using the Enter key.
        if (
          e.key !== "Enter" &&
          isHTMLAnchorLink(state.target) &&
          state.target.contains(target) &&
          !e[LINK_CLICKED]
        ) {
          // Store a hidden property on the event so we only trigger link click once,
          // even if there are multiple usePress instances attached to the element.
          e[LINK_CLICKED] = true;
          openLink(state.target, e, false);
        }

        state.isPressed = false;
        state.metaKeyEvents?.delete(e.key);
      } else if (e.key === "Meta" && state.metaKeyEvents?.size) {
        // If we recorded keydown events that occurred while the Meta key was pressed,
        // and those haven't received keyup events already, fire keyup events ourselves.
        // See comment above for more info about the macOS bug causing this.
        const events = state.metaKeyEvents;
        state.metaKeyEvents = undefined;
        for (const event of events.values()) {
          state.target?.dispatchEvent(new KeyboardEvent("keyup", event));
        }
      }
    };

    if (typeof PointerEvent !== "undefined") {
      pressProps.onPointerDown = (e) => {
        // Only handle left clicks, and ignore events that bubbled through portals.
        if (e.button !== 0 || !e.currentTarget.contains(e.target as Element)) {
          return;
        }

        // iOS safari fires pointer events from VoiceOver with incorrect coordinates/target.
        // Ignore and let the onClick handler take care of it instead.
        // https://bugs.webkit.org/show_bug.cgi?id=222627
        // https://bugs.webkit.org/show_bug.cgi?id=223202
        if (isVirtualPointerEvent(e.nativeEvent)) {
          state.pointerType = "virtual";
          return;
        }

        // Due to browser inconsistencies, especially on mobile browsers, we prevent
        // default on pointer down and handle focusing the pressable element ourselves.
        if (shouldPreventDefault(e.currentTarget as Element)) {
          e.preventDefault();
        }

        state.pointerType = e.pointerType;

        let shouldStopPropagation = true;
        if (!state.isPressed) {
          state.isPressed = true;
          state.isOverTarget = true;
          state.activePointerId = e.pointerId;
          state.target = e.currentTarget;

          if (!isDisabled && !preventFocusOnPress) {
            focusWithoutScrolling(e.currentTarget);
          }

          if (!allowTextSelectionOnPress) {
            disableTextSelection(state.target);
          }

          shouldStopPropagation = triggerPressStart(e, state.pointerType);

          addGlobalListener(
            getOwnerDocument(e.currentTarget),
            "pointermove",
            onPointerMove,
            false
          );
          addGlobalListener(
            getOwnerDocument(e.currentTarget),
            "pointerup",
            onPointerUp,
            false
          );
          addGlobalListener(
            getOwnerDocument(e.currentTarget),
            "pointercancel",
            onPointerCancel,
            false
          );
        }

        if (shouldStopPropagation) {
          e.stopPropagation();
        }
      };

      pressProps.onMouseDown = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        if (e.button === 0) {
          // Chrome and Firefox on touch Windows devices require mouse down events
          // to be canceled in addition to pointer events, or an extra asynchronous
          // focus event will be fired.
          if (shouldPreventDefault(e.currentTarget as Element)) {
            e.preventDefault();
          }

          e.stopPropagation();
        }
      };

      pressProps.onPointerUp = (e) => {
        // iOS fires pointerup with zero width and height, so check the pointerType recorded during pointerdown.
        if (
          !e.currentTarget.contains(e.target as Element) ||
          state.pointerType === "virtual"
        ) {
          return;
        }

        // Only handle left clicks
        // Safari on iOS sometimes fires pointerup events, even
        // when the touch isn't over the target, so double check.
        if (e.button === 0 && isOverTarget(e, e.currentTarget)) {
          triggerPressUp(e, state.pointerType || e.pointerType);
        }
      };

      // Safari on iOS < 13.2 does not implement pointerenter/pointerleave events correctly.
      // Use pointer move events instead to implement our own hit testing.
      // See https://bugs.webkit.org/show_bug.cgi?id=199803
      const onPointerMove = (e: PointerEvent): void => {
        if (e.pointerId !== state.activePointerId) {
          return;
        }

        if (state.target && isOverTarget(e, state.target)) {
          if (!state.isOverTarget && state.pointerType !== null) {
            state.isOverTarget = true;
            triggerPressStart(createEvent(state.target, e), state.pointerType);
          }
        } else if (
          state.target &&
          state.isOverTarget &&
          state.pointerType !== null
        ) {
          state.isOverTarget = false;
          triggerPressEnd(
            createEvent(state.target, e),
            state.pointerType,
            false
          );
          cancelOnPointerExit(e);
        }
      };

      const onPointerUp = (e: PointerEvent): void => {
        if (
          e.pointerId === state.activePointerId &&
          state.isPressed &&
          e.button === 0 &&
          state.target
        ) {
          if (isOverTarget(e, state.target) && state.pointerType !== null) {
            triggerPressEnd(createEvent(state.target, e), state.pointerType);
          } else if (state.isOverTarget && state.pointerType !== null) {
            triggerPressEnd(
              createEvent(state.target, e),
              state.pointerType,
              false
            );
          }

          state.isPressed = false;
          state.isOverTarget = false;
          state.activePointerId = null;
          state.pointerType = null;
          removeAllGlobalListeners();
          if (!allowTextSelectionOnPress) {
            restoreTextSelection(state.target);
          }
        }
      };

      const onPointerCancel = (e: PointerEvent): void => {
        cancel(e);
      };

      pressProps.onDragStart = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        // Safari does not call onPointerCancel when a drag starts, whereas Chrome and Firefox do.
        cancel(e);
      };
    } else {
      pressProps.onMouseDown = (e) => {
        // Only handle left clicks
        if (e.button !== 0 || !e.currentTarget.contains(e.target as Element)) {
          return;
        }

        // Due to browser inconsistencies, especially on mobile browsers, we prevent
        // default on mouse down and handle focusing the pressable element ourselves.
        if (shouldPreventDefault(e.currentTarget)) {
          e.preventDefault();
        }

        if (state.ignoreEmulatedMouseEvents) {
          e.stopPropagation();
          return;
        }

        state.isPressed = true;
        state.isOverTarget = true;
        state.target = e.currentTarget;
        state.pointerType = isVirtualClick(e.nativeEvent) ? "virtual" : "mouse";

        if (!isDisabled && !preventFocusOnPress) {
          focusWithoutScrolling(e.currentTarget);
        }

        const shouldStopPropagation = triggerPressStart(e, state.pointerType);
        if (shouldStopPropagation) {
          e.stopPropagation();
        }

        addGlobalListener(
          getOwnerDocument(e.currentTarget),
          "mouseup",
          onMouseUp,
          false
        );
      };

      pressProps.onMouseEnter = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        let shouldStopPropagation = true;
        if (
          state.isPressed &&
          !state.ignoreEmulatedMouseEvents &&
          state.pointerType !== null
        ) {
          state.isOverTarget = true;
          shouldStopPropagation = triggerPressStart(e, state.pointerType);
        }

        if (shouldStopPropagation) {
          e.stopPropagation();
        }
      };

      pressProps.onMouseLeave = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        let shouldStopPropagation = true;
        if (
          state.isPressed &&
          !state.ignoreEmulatedMouseEvents &&
          state.pointerType !== null
        ) {
          state.isOverTarget = false;
          shouldStopPropagation = triggerPressEnd(e, state.pointerType, false);
          cancelOnPointerExit(e);
        }

        if (shouldStopPropagation) {
          e.stopPropagation();
        }
      };

      pressProps.onMouseUp = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        if (!state.ignoreEmulatedMouseEvents && e.button === 0) {
          triggerPressUp(e, state.pointerType || "mouse");
        }
      };

      const onMouseUp = (e: MouseEvent): void => {
        // Only handle left clicks
        if (e.button !== 0) {
          return;
        }

        state.isPressed = false;
        removeAllGlobalListeners();

        if (state.ignoreEmulatedMouseEvents) {
          state.ignoreEmulatedMouseEvents = false;
          return;
        }

        if (
          state.target &&
          isOverTarget(e, state.target) &&
          state.pointerType !== null
        ) {
          triggerPressEnd(createEvent(state.target, e), state.pointerType);
        } else if (
          state.target &&
          state.isOverTarget &&
          state.pointerType !== null
        ) {
          triggerPressEnd(
            createEvent(state.target, e),
            state.pointerType,
            false
          );
        }

        state.isOverTarget = false;
      };

      pressProps.onTouchStart = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        const touch = getTouchFromEvent(e.nativeEvent);
        if (!touch) {
          return;
        }
        state.activePointerId = touch.identifier;
        state.ignoreEmulatedMouseEvents = true;
        state.isOverTarget = true;
        state.isPressed = true;
        state.target = e.currentTarget;
        state.pointerType = "touch";

        // Due to browser inconsistencies, especially on mobile browsers, we prevent default
        // on the emulated mouse event and handle focusing the pressable element ourselves.
        if (!isDisabled && !preventFocusOnPress) {
          focusWithoutScrolling(e.currentTarget);
        }

        if (!allowTextSelectionOnPress) {
          disableTextSelection(state.target);
        }

        const shouldStopPropagation = triggerPressStart(e, state.pointerType);
        if (shouldStopPropagation) {
          e.stopPropagation();
        }

        addGlobalListener(
          getOwnerWindow(e.currentTarget),
          "scroll",
          onScroll,
          true
        );
      };

      pressProps.onTouchMove = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        if (!state.isPressed) {
          e.stopPropagation();
          return;
        }

        const touch = getTouchById(e.nativeEvent, state.activePointerId);
        let shouldStopPropagation = true;
        if (touch && isOverTarget(touch, e.currentTarget)) {
          if (!state.isOverTarget && state.pointerType !== null) {
            state.isOverTarget = true;
            shouldStopPropagation = triggerPressStart(e, state.pointerType);
          }
        } else if (state.isOverTarget && state.pointerType !== null) {
          state.isOverTarget = false;
          shouldStopPropagation = triggerPressEnd(e, state.pointerType, false);
          cancelOnPointerExit(e);
        }

        if (shouldStopPropagation) {
          e.stopPropagation();
        }
      };

      pressProps.onTouchEnd = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        if (!state.isPressed) {
          e.stopPropagation();
          return;
        }

        const touch = getTouchById(e.nativeEvent, state.activePointerId);
        let shouldStopPropagation = true;
        if (
          touch &&
          isOverTarget(touch, e.currentTarget) &&
          state.pointerType !== null
        ) {
          triggerPressUp(e, state.pointerType);
          shouldStopPropagation = triggerPressEnd(e, state.pointerType);
        } else if (state.isOverTarget && state.pointerType !== null) {
          shouldStopPropagation = triggerPressEnd(e, state.pointerType, false);
        }

        if (shouldStopPropagation) {
          e.stopPropagation();
        }

        state.isPressed = false;
        state.activePointerId = null;
        state.isOverTarget = false;
        state.ignoreEmulatedMouseEvents = true;
        if (state.target && !allowTextSelectionOnPress) {
          restoreTextSelection(state.target);
        }
        removeAllGlobalListeners();
      };

      pressProps.onTouchCancel = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        e.stopPropagation();
        if (state.isPressed) {
          cancel(e);
        }
      };

      const onScroll = (e: Event): void => {
        if (state.isPressed && (e.target as Element).contains(state.target)) {
          cancel({
            currentTarget: state.target,
            shiftKey: false,
            ctrlKey: false,
            metaKey: false,
            altKey: false,
          });
        }
      };

      pressProps.onDragStart = (e) => {
        if (!e.currentTarget.contains(e.target as Element)) {
          return;
        }

        cancel(e);
      };
    }

    return pressProps;
  }, [
    addGlobalListener,
    isDisabled,
    preventFocusOnPress,
    removeAllGlobalListeners,
    allowTextSelectionOnPress,
    cancel,
    cancelOnPointerExit,
    triggerPressEnd,
    triggerPressStart,
    triggerPressUp,
  ]);

  // Remove user-select: none in case component unmounts immediately after pressStart

  useEffect(() => {
    const currentRef = ref.current;
    return () => {
      if (!allowTextSelectionOnPress) {
        restoreTextSelection(currentRef.target ?? undefined);
      }
    };
  }, [allowTextSelectionOnPress]);

  return {
    isPressed: isPressedProp || isPressed,
    pressProps: mergeProps(domProps, pressProps),
  };
}

function isHTMLAnchorLink(target: Element): target is HTMLAnchorElement {
  return target.tagName === "A" && target.hasAttribute("href");
}

function isValidKeyboardEvent(
  event: KeyboardEvent,
  currentTarget: Element
): boolean {
  const { key, code } = event;
  const element = currentTarget as HTMLElement;
  const role = element.getAttribute("role");
  // Accessibility for keyboards. Space and Enter only.
  // "Spacebar" is for IE 11
  return (
    (key === "Enter" ||
      key === " " ||
      key === "Spacebar" ||
      code === "Space") &&
    !(
      (element instanceof getOwnerWindow(element).HTMLInputElement &&
        !isValidInputKey(element, key)) ||
      element instanceof getOwnerWindow(element).HTMLTextAreaElement ||
      element.isContentEditable
    ) &&
    // Links should only trigger with Enter key
    !(
      (role === "link" || (!role && isHTMLAnchorLink(element))) &&
      key !== "Enter"
    )
  );
}

function getTouchFromEvent(event: TouchEvent): Touch | null {
  const { targetTouches } = event;
  if (targetTouches.length > 0) {
    return targetTouches[0];
  }
  return null;
}

function getTouchById(
  event: TouchEvent,
  pointerId: null | number
): null | Touch {
  const changedTouches = event.changedTouches;
  for (const touch of Array.from(changedTouches)) {
    if (touch.identifier === pointerId) {
      return touch;
    }
  }
  return null;
}

function createEvent(target: FocusableElement, e: EventBase): EventBase {
  return {
    currentTarget: target,
    shiftKey: e.shiftKey,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    altKey: e.altKey,
  };
}

type Rect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type EventPoint = {
  clientX: number;
  clientY: number;
  width?: number;
  height?: number;
  radiusX?: number;
  radiusY?: number;
};

function getPointClientRect(point: EventPoint): Rect {
  let offsetX = 0;
  let offsetY = 0;
  if (point.width !== undefined) {
    offsetX = point.width / 2;
  } else if (point.radiusX !== undefined) {
    offsetX = point.radiusX;
  }
  if (point.height !== undefined) {
    offsetY = point.height / 2;
  } else if (point.radiusY !== undefined) {
    offsetY = point.radiusY;
  }

  return {
    top: point.clientY - offsetY,
    right: point.clientX + offsetX,
    bottom: point.clientY + offsetY,
    left: point.clientX - offsetX,
  };
}

function areRectanglesOverlapping(a: Rect, b: Rect): boolean {
  // check if they cannot overlap on x axis
  if (a.left > b.right || b.left > a.right) {
    return false;
  }
  // check if they cannot overlap on y axis
  if (a.top > b.bottom || b.top > a.bottom) {
    return false;
  }
  return true;
}

function isOverTarget(point: EventPoint, target: Element): boolean {
  const rect = target.getBoundingClientRect();
  const pointRect = getPointClientRect(point);
  return areRectanglesOverlapping(rect, pointRect);
}

function shouldPreventDefault(target: Element): boolean {
  // We cannot prevent default if the target is a draggable element.
  return !(target instanceof HTMLElement) || !target.hasAttribute("draggable");
}

function shouldPreventDefaultKeyboard(target: Element, key: string): boolean {
  if (target instanceof HTMLInputElement) {
    return !isValidInputKey(target, key);
  }

  if (target instanceof HTMLButtonElement) {
    return target.type !== "submit" && target.type !== "reset";
  }

  if (isHTMLAnchorLink(target)) {
    return false;
  }

  return true;
}

const nonTextInputTypes = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
]);

function isValidInputKey(target: HTMLInputElement, key: string): boolean {
  // Only space should toggle checkboxes and radios, not enter.
  return target.type === "checkbox" || target.type === "radio"
    ? key === " "
    : nonTextInputTypes.has(target.type);
}
