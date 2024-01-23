const transitionsByElement = new Map<EventTarget, Set<string>>();

// A list of callbacks to call once there are no transitioning elements.
const transitionCallbacks = new Set<() => void>();

function setupGlobalEvents(): void {
  if (typeof window === "undefined") {
    return;
  }

  const onTransitionStart = (e: TransitionEvent): void => {
    // Add the transitioning property to the list for this element.
    let transitions = transitionsByElement.get(e.target!);
    if (!transitions) {
      transitions = new Set();
      transitionsByElement.set(e.target!, transitions);

      // The transitioncancel event must be registered on the element itself, rather than as a global
      // event. This enables us to handle when the node is deleted from the document while it is transitioning.
      // In that case, the cancel event would have nowhere to bubble to so we need to handle it directly.
      if (e.target) {
        e.target.addEventListener(
          "transitioncancel",
          onTransitionEnd as EventListener
        );
      }
    }

    transitions.add(e.propertyName);
  };

  const onTransitionEnd = (e: TransitionEvent): void => {
    // Remove property from list of transitioning properties.
    const properties = transitionsByElement.get(e.target!);
    if (!properties) {
      return;
    }

    properties.delete(e.propertyName);

    // If empty, remove transitioncancel event, and remove the element from the list of transitioning elements.
    if (properties.size === 0) {
      const target = e.target!;
      target.removeEventListener(
        "transitioncancel",
        onTransitionEnd as EventListener
      );
      transitionsByElement.delete(target);
    }

    // If no transitioning elements, call all of the queued callbacks.
    if (transitionsByElement.size === 0) {
      for (const cb of transitionCallbacks) {
        cb();
      }

      transitionCallbacks.clear();
    }
  };

  document.body.addEventListener("transitionrun", onTransitionStart);
  document.body.addEventListener("transitionend", onTransitionEnd);
}

if (typeof document !== "undefined") {
  if (document.readyState !== "loading") {
    setupGlobalEvents();
  } else {
    document.addEventListener("DOMContentLoaded", setupGlobalEvents);
  }
}

export function runAfterTransition(fn: () => void): void {
  // Wait one frame to see if an animation starts, e.g. a transition on mount.
  requestAnimationFrame(() => {
    // If no transitions are running, call the function immediately.
    // Otherwise, add it to a list of callbacks to run at the end of the animation.
    if (transitionsByElement.size === 0) {
      fn();
    } else {
      transitionCallbacks.add(fn);
    }
  });
}
