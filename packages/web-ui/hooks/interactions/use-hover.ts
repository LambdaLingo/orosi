import { useEffect, useMemo, useRef, useState } from "react";
import type { HoverEvents } from "../../types/shared/events";
import type { DOMAttributes } from "../../types/shared/dom";
import type { isDisabledProp } from "../../types/shared/component";

export type HoverProps = HoverEvents & isDisabledProp;

export type HoverResult = {
  /** Props to spread on the target element. */
  hoverProps: DOMAttributes;
  isHovered: boolean;
};

// iOS fires onPointerEnter twice: once with pointerType="touch" and again with pointerType="mouse".
// We want to ignore these emulated events so they do not trigger hover behavior.
// See https://bugs.webkit.org/show_bug.cgi?id=214609.
let globalIgnoreEmulatedMouseEvents = false;
let hoverCount = 0;

function setGlobalIgnoreEmulatedMouseEvents() {
  globalIgnoreEmulatedMouseEvents = true;

  // Clear globalIgnoreEmulatedMouseEvents after a short timeout. iOS fires onPointerEnter
  // with pointerType="mouse" immediately after onPointerUp and before onFocus. On other
  // devices that don't have this quirk, we don't want to ignore a mouse hover sometime in
  // the distant future because a user previously touched the element.
  setTimeout(() => {
    globalIgnoreEmulatedMouseEvents = false;
  }, 50);
}

function handleGlobalPointerEvent(e: { pointerType: string }) {
  if (e.pointerType === "touch") {
    setGlobalIgnoreEmulatedMouseEvents();
  }
}

function setupGlobalTouchEvents() {
  if (typeof document === "undefined") {
    return;
  }

  if (typeof PointerEvent !== "undefined") {
    document.addEventListener("pointerup", handleGlobalPointerEvent);
  } else {
    document.addEventListener("touchend", setGlobalIgnoreEmulatedMouseEvents);
  }

  hoverCount++;
  return () => {
    hoverCount--;
    if (hoverCount > 0) {
      return;
    }

    if (typeof PointerEvent !== "undefined") {
      document.removeEventListener("pointerup", handleGlobalPointerEvent);
    } else {
      document.removeEventListener(
        "touchend",
        setGlobalIgnoreEmulatedMouseEvents
      );
    }
  };
}

/**
 * Handles pointer hover interactions for an element. Normalizes behavior
 * across browsers and platforms, and ignores emulated mouse events on touch devices.
 */
export function useHover(props: HoverProps): HoverResult {
  let { onHoverStart, onHoverChange, onHoverEnd, isDisabled } = props;

  let [isHovered, setHovered] = useState(false);
  let state = useRef({
    isHovered: false,
    ignoreEmulatedMouseEvents: false,
    pointerType: "",
    target: null,
  }).current;

  useEffect(setupGlobalTouchEvents, []);

  let { hoverProps, triggerHoverEnd } = useMemo(() => {
    let triggerHoverStart = (event, pointerType) => {
      state.pointerType = pointerType;
      if (
        isDisabled ||
        pointerType === "touch" ||
        state.isHovered ||
        !event.currentTarget.contains(event.target)
      ) {
        return;
      }

      state.isHovered = true;
      let target = event.currentTarget;
      state.target = target;

      if (onHoverStart) {
        onHoverStart({
          type: "hoverstart",
          target,
          pointerType,
        });
      }

      if (onHoverChange) {
        onHoverChange(true);
      }

      setHovered(true);
    };

    let triggerHoverEnd = (event, pointerType) => {
      state.pointerType = "";
      state.target = null;

      if (pointerType === "touch" || !state.isHovered) {
        return;
      }

      state.isHovered = false;
      let target = event.currentTarget;
      if (onHoverEnd) {
        onHoverEnd({
          type: "hoverend",
          target,
          pointerType,
        });
      }

      if (onHoverChange) {
        onHoverChange(false);
      }

      setHovered(false);
    };

    let hoverProps: DOMAttributes = {};

    if (typeof PointerEvent !== "undefined") {
      hoverProps.onPointerEnter = (e) => {
        if (globalIgnoreEmulatedMouseEvents && e.pointerType === "mouse") {
          return;
        }

        triggerHoverStart(e, e.pointerType);
      };

      hoverProps.onPointerLeave = (e) => {
        if (!isDisabled && e.currentTarget.contains(e.target as Element)) {
          triggerHoverEnd(e, e.pointerType);
        }
      };
    } else {
      hoverProps.onTouchStart = () => {
        state.ignoreEmulatedMouseEvents = true;
      };

      hoverProps.onMouseEnter = (e) => {
        if (
          !state.ignoreEmulatedMouseEvents &&
          !globalIgnoreEmulatedMouseEvents
        ) {
          triggerHoverStart(e, "mouse");
        }

        state.ignoreEmulatedMouseEvents = false;
      };

      hoverProps.onMouseLeave = (e) => {
        if (!isDisabled && e.currentTarget.contains(e.target as Element)) {
          triggerHoverEnd(e, "mouse");
        }
      };
    }
    return { hoverProps, triggerHoverEnd };
  }, [onHoverStart, onHoverChange, onHoverEnd, isDisabled, state]);

  useEffect(() => {
    // Call the triggerHoverEnd as soon as isDisabled changes to true
    // Safe to call triggerHoverEnd, it will early return if we aren't currently hovering
    if (isDisabled) {
      triggerHoverEnd({ currentTarget: state.target }, state.pointerType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled]);

  return {
    hoverProps,
    isHovered,
  };
}
