import { useMemo, useRef } from "react";
import type { DOMAttributes, MoveEvents, PointerType } from "types";
import { useEffectEvent, useGlobalListeners } from "hooks";
import { disableTextSelection, restoreTextSelection } from "utilities";

type MoveResult = {
  /** Props to spread on the target element. */
  moveProps: DOMAttributes;
};

type EventBase = {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
};

/**
 * Handles move interactions across mouse, touch, and keyboard, including dragging with
 * the mouse or touch, and using the arrow keys. Normalizes behavior across browsers and
 * platforms, and ignores emulated mouse events on touch devices.
 */
export function useMove(props: MoveEvents): MoveResult {
  const { onMoveStart, onMove, onMoveEnd } = props;

  const state = useRef<{
    didMove: boolean;
    lastPosition: { pageX: number; pageY: number } | null;
    id: number | null;
  }>({ didMove: false, lastPosition: null, id: null });

  const { addGlobalListener, removeGlobalListener } = useGlobalListeners();

  const move = useEffectEvent(
    (
      originalEvent: EventBase,
      pointerType: PointerType,
      deltaX: number,
      deltaY: number
    ) => {
      if (deltaX === 0 && deltaY === 0) {
        return;
      }

      if (!state.current.didMove) {
        state.current.didMove = true;
        onMoveStart?.({
          type: "movestart",
          pointerType,
          shiftKey: originalEvent.shiftKey,
          metaKey: originalEvent.metaKey,
          ctrlKey: originalEvent.ctrlKey,
          altKey: originalEvent.altKey,
        });
      }
      onMove?.({
        type: "move",
        pointerType,
        deltaX,
        deltaY,
        shiftKey: originalEvent.shiftKey,
        metaKey: originalEvent.metaKey,
        ctrlKey: originalEvent.ctrlKey,
        altKey: originalEvent.altKey,
      });
    }
  );

  const end = useEffectEvent(
    (originalEvent: EventBase, pointerType: PointerType) => {
      restoreTextSelection();
      if (state.current.didMove) {
        onMoveEnd?.({
          type: "moveend",
          pointerType,
          shiftKey: originalEvent.shiftKey,
          metaKey: originalEvent.metaKey,
          ctrlKey: originalEvent.ctrlKey,
          altKey: originalEvent.altKey,
        });
      }
    }
  );

  const moveProps = useMemo(() => {
    const moveProps: DOMAttributes = {};

    const start = (): void => {
      disableTextSelection();
      state.current.didMove = false;
    };

    if (typeof PointerEvent === "undefined") {
      const onMouseMove = (e: MouseEvent): void => {
        if (e.button === 0) {
          move(
            e,
            "mouse",
            e.pageX - (state.current.lastPosition?.pageX ?? 0),
            e.pageY - (state.current.lastPosition?.pageY ?? 0)
          );
          state.current.lastPosition = { pageX: e.pageX, pageY: e.pageY };
        }
      };
      const onMouseUp = (e: MouseEvent): void => {
        if (e.button === 0) {
          end(e, "mouse");
          removeGlobalListener(window, "mousemove", onMouseMove, false);
          removeGlobalListener(window, "mouseup", onMouseUp, false);
        }
      };
      moveProps.onMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
          start();
          e.stopPropagation();
          e.preventDefault();
          state.current.lastPosition = { pageX: e.pageX, pageY: e.pageY };
          addGlobalListener(window, "mousemove", onMouseMove, false);
          addGlobalListener(window, "mouseup", onMouseUp, false);
        }
      };

      const onTouchMove = (e: TouchEvent): void => {
        const touch = Array.from(e.changedTouches).findIndex(
          ({ identifier }) => identifier === state.current.id
        );
        if (touch >= 0) {
          const { pageX, pageY } = e.changedTouches[touch];
          move(
            e,
            "touch",
            pageX - (state.current.lastPosition?.pageX ?? 0),
            pageY - (state.current.lastPosition?.pageY ?? 0)
          );
          state.current.lastPosition = { pageX, pageY };
        }
      };
      const onTouchEnd = (e: TouchEvent): void => {
        const touch = Array.from(e.changedTouches).findIndex(
          ({ identifier }) => identifier === state.current.id
        );
        if (touch >= 0) {
          end(e, "touch");
          state.current.id = null;
          removeGlobalListener(window, "touchmove", onTouchMove);
          removeGlobalListener(window, "touchend", onTouchEnd);
          removeGlobalListener(window, "touchcancel", onTouchEnd);
        }
      };
      moveProps.onTouchStart = (e: React.TouchEvent) => {
        if (e.changedTouches.length === 0 || state.current.id !== null) {
          return;
        }

        const { pageX, pageY, identifier } = e.changedTouches[0];
        start();
        e.stopPropagation();
        e.preventDefault();
        state.current.lastPosition = { pageX, pageY };
        state.current.id = identifier;
        addGlobalListener(window, "touchmove", onTouchMove, false);
        addGlobalListener(window, "touchend", onTouchEnd, false);
        addGlobalListener(window, "touchcancel", onTouchEnd, false);
      };
    } else {
      const onPointerMove = (e: PointerEvent): void => {
        if (e.pointerId === state.current.id) {
          const pointerType = (e.pointerType || "mouse") as PointerType;

          // Problems with PointerEvent#movementX/movementY:
          // 1. it is always 0 on macOS Safari.
          // 2. On Chrome Android, it's scaled by devicePixelRatio, but not on Chrome macOS
          move(
            e,
            pointerType,
            e.pageX - (state.current.lastPosition?.pageX ?? 0),
            e.pageY - (state.current.lastPosition?.pageY ?? 0)
          );
          state.current.lastPosition = { pageX: e.pageX, pageY: e.pageY };
        }
      };

      const onPointerUp = (e: PointerEvent): void => {
        if (e.pointerId === state.current.id) {
          const pointerType = (e.pointerType || "mouse") as PointerType;
          end(e, pointerType);
          state.current.id = null;
          removeGlobalListener(window, "pointermove", onPointerMove, false);
          removeGlobalListener(window, "pointerup", onPointerUp, false);
          removeGlobalListener(window, "pointercancel", onPointerUp, false);
        }
      };

      moveProps.onPointerDown = (e: React.PointerEvent) => {
        if (e.button === 0 && state.current.id === null) {
          start();
          e.stopPropagation();
          e.preventDefault();
          state.current.lastPosition = { pageX: e.pageX, pageY: e.pageY };
          state.current.id = e.pointerId;
          addGlobalListener(window, "pointermove", onPointerMove, false);
          addGlobalListener(window, "pointerup", onPointerUp, false);
          addGlobalListener(window, "pointercancel", onPointerUp, false);
        }
      };
    }

    const triggerKeyboardMove = (
      e: EventBase,
      deltaX: number,
      deltaY: number
    ): void => {
      start();
      move(e, "keyboard", deltaX, deltaY);
      end(e, "keyboard");
    };

    moveProps.onKeyDown = (e) => {
      switch (e.key) {
        case "Left":
        case "ArrowLeft":
          e.preventDefault();
          e.stopPropagation();
          triggerKeyboardMove(e, -1, 0);
          break;
        case "Right":
        case "ArrowRight":
          e.preventDefault();
          e.stopPropagation();
          triggerKeyboardMove(e, 1, 0);
          break;
        case "Up":
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          triggerKeyboardMove(e, 0, -1);
          break;
        case "Down":
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          triggerKeyboardMove(e, 0, 1);
          break;
      }
    };

    return moveProps;
  }, [state, addGlobalListener, removeGlobalListener, move, end]);

  return { moveProps };
}
