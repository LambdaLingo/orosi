import { useEffect, useState } from "react";
import { isVirtualClick, isMac } from "utilities";
import { useIsSSR } from "hooks/ssr";

export type Modality = "keyboard" | "pointer" | "virtual";
type HandlerEvent =
  | PointerEvent
  | MouseEvent
  | KeyboardEvent
  | FocusEvent
  | null;
type Handler = (modality: Modality, e: HandlerEvent) => void;
export type FocusVisibleHandler = (isFocusVisible: boolean) => void;
export type FocusVisibleProps = {
  /** Whether the element is a text input. */
  isTextInput?: boolean;
  /** Whether the element will be auto focused. */
  autoFocus?: boolean;
};

export type FocusVisibleResult = {
  /** Whether keyboard focus is visible globally. */
  isFocusVisible: boolean;
};

let currentModality: null | Modality = null;
const changeHandlers = new Set<Handler>();
let hasSetupGlobalListeners = false;
let hasEventBeforeFocus = false;
let hasBlurredWindowRecently = false;

// Only Tab or Esc keys will make focus visible on text input elements
const FOCUS_VISIBLE_INPUT_KEYS: Record<string, boolean> = {
  Tab: true,
  Escape: true,
};

function triggerChangeHandlers(modality: Modality, e: HandlerEvent): void {
  for (const handler of changeHandlers) {
    handler(modality, e);
  }
}

/**
 * Helper function to determine if a KeyboardEvent is unmodified and could make keyboard focus styles visible.
 */
function isValidKey(e: KeyboardEvent): boolean {
  // Control and Shift keys trigger when navigating back to the tab with keyboard.
  return !(
    e.metaKey ||
    (!isMac() && e.altKey) ||
    e.ctrlKey ||
    e.key === "Control" ||
    e.key === "Shift" ||
    e.key === "Meta"
  );
}

function handleKeyboardEvent(e: KeyboardEvent): void {
  hasEventBeforeFocus = true;
  if (isValidKey(e)) {
    currentModality = "keyboard";
    triggerChangeHandlers("keyboard", e);
  }
}

function handlePointerEvent(e: PointerEvent | MouseEvent): void {
  currentModality = "pointer";
  if (e.type === "mousedown" || e.type === "pointerdown") {
    hasEventBeforeFocus = true;
    triggerChangeHandlers("pointer", e);
  }
}

function handleClickEvent(e: MouseEvent): void {
  if (isVirtualClick(e)) {
    hasEventBeforeFocus = true;
    currentModality = "virtual";
  }
}

function handleFocusEvent(e: FocusEvent): void {
  // Firefox fires two extra focus events when the user first clicks into an iframe:
  // first on the window, then on the document. We ignore these events so they don't
  // cause keyboard focus rings to appear.
  if (e.target === window || e.target === document) {
    return;
  }

  // If a focus event occurs without a preceding keyboard or pointer event, switch to virtual modality.
  // This occurs, for example, when navigating a form with the next/previous buttons on iOS.
  if (!hasEventBeforeFocus && !hasBlurredWindowRecently) {
    currentModality = "virtual";
    triggerChangeHandlers("virtual", e);
  }

  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = false;
}

function handleWindowBlur(): void {
  // When the window is blurred, reset state. This is necessary when tabbing out of the window,
  // for example, since a subsequent focus event won't be fired.
  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = true;
}

/**
 * Setup global event listeners to control when keyboard focus style should be visible.
 */
function setupGlobalFocusEvents(): void {
  if (typeof window === "undefined" || hasSetupGlobalListeners) {
    return;
  }

  // Programmatic focus() calls shouldn't affect the current input modality.
  // However, we need to detect other cases when a focus event occurs without
  // a preceding user event (e.g. screen reader focus). Overriding the focus
  // method on HTMLElement.prototype is a bit hacky, but works.
  const focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = (
    ...args: [options?: FocusOptions | undefined]
  ) => {
    hasEventBeforeFocus = true;
    focus.apply(document.activeElement, args);
  };

  document.addEventListener("keydown", handleKeyboardEvent, true);
  document.addEventListener("keyup", handleKeyboardEvent, true);
  document.addEventListener("click", handleClickEvent, true);

  // Register focus events on the window so they are sure to happen
  // before React's event listeners (registered on the document).
  window.addEventListener("focus", handleFocusEvent, true);
  window.addEventListener("blur", handleWindowBlur, false);

  if (typeof PointerEvent !== "undefined") {
    document.addEventListener("pointerdown", handlePointerEvent, true);
    document.addEventListener("pointermove", handlePointerEvent, true);
    document.addEventListener("pointerup", handlePointerEvent, true);
  } else {
    document.addEventListener("mousedown", handlePointerEvent, true);
    document.addEventListener("mousemove", handlePointerEvent, true);
    document.addEventListener("mouseup", handlePointerEvent, true);
  }

  hasSetupGlobalListeners = true;
}

if (typeof document !== "undefined") {
  if (document.readyState !== "loading") {
    setupGlobalFocusEvents();
  } else {
    document.addEventListener("DOMContentLoaded", setupGlobalFocusEvents);
  }
}

/**
 * If true, keyboard focus is visible.
 */
export function isFocusVisible(): boolean {
  return currentModality !== "pointer";
}

export function getInteractionModality(): Modality | null {
  return currentModality;
}

export function setInteractionModality(modality: Modality): void {
  currentModality = modality;
  triggerChangeHandlers(modality, null);
}

/**
 * Keeps state of the current modality.
 */
export function useInteractionModality(): Modality | null {
  setupGlobalFocusEvents();

  const [modality, setModality] = useState(currentModality);
  useEffect(() => {
    const handler = (): void => {
      setModality(currentModality);
    };

    changeHandlers.add(handler);
    return () => {
      changeHandlers.delete(handler);
    };
  }, []);

  return useIsSSR() ? null : modality;
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

/**
 * If this is attached to text input component, return if the event is a focus event (Tab/Escape keys pressed) so that
 * focus visible style can be properly set.
 */
function isKeyboardFocusEvent(
  isTextInput: boolean,
  modality: Modality,
  e: HandlerEvent
): boolean {
  isTextInput =
    isTextInput ||
    (e?.target instanceof HTMLInputElement &&
      !nonTextInputTypes.has(e?.target?.type)) ||
    e?.target instanceof HTMLTextAreaElement ||
    (e?.target instanceof HTMLElement && e?.target.isContentEditable);
  return !(
    isTextInput &&
    modality === "keyboard" &&
    e instanceof KeyboardEvent &&
    !FOCUS_VISIBLE_INPUT_KEYS[e.key]
  );
}

/**
 * Manages focus visible state for the page, and subscribes individual components for updates.
 */
export function useFocusVisible(
  props: FocusVisibleProps = {}
): FocusVisibleResult {
  const { isTextInput, autoFocus } = props;
  const [isFocusVisibleState, setIsFocusVisibleState] = useState(
    autoFocus || isFocusVisible()
  );
  useFocusVisibleListener(
    (isFocusVisible) => {
      setIsFocusVisibleState(isFocusVisible);
    },
    [isTextInput],
    { isTextInput }
  );

  return { isFocusVisible: isFocusVisibleState };
}

/**
 * Listens for trigger change and reports if focus is visible (i.e., modality is not pointer).
 */
export function useFocusVisibleListener(
  fn: FocusVisibleHandler,
  deps: readonly any[],
  opts?: { isTextInput?: boolean }
): void {
  setupGlobalFocusEvents();

  useEffect(() => {
    const handler = (modality: Modality, e: HandlerEvent): void => {
      if (!isKeyboardFocusEvent(Boolean(opts?.isTextInput), modality, e)) {
        return;
      }
      fn(isFocusVisible());
    };
    changeHandlers.add(handler);
    return () => {
      changeHandlers.delete(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
