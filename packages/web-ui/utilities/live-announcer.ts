type Assertiveness = "assertive" | "polite";

/* Inspired by https://github.com/AlmeroSteyn/react-aria-live */
const LIVEREGION_TIMEOUT_DELAY = 7000;

let liveAnnouncer: LiveAnnouncer | null = null;

/**
 * Announces the message using screen reader technology.
 */
export function announce(
  message: string,
  assertiveness: Assertiveness = "assertive",
  timeout = LIVEREGION_TIMEOUT_DELAY
): void {
  if (!liveAnnouncer) {
    liveAnnouncer = new LiveAnnouncer();
  }

  liveAnnouncer.announce(message, assertiveness, timeout);
}

/**
 * Stops all queued announcements.
 */
export function clearAnnouncer(assertiveness: Assertiveness): void {
  if (liveAnnouncer) {
    liveAnnouncer.clear(assertiveness);
  }
}

/**
 * Removes the announcer from the DOM.
 */
export function destroyAnnouncer(): void {
  if (liveAnnouncer) {
    liveAnnouncer.destroy();
    liveAnnouncer = null;
  }
}

// LiveAnnouncer is implemented using vanilla DOM, not React. That's because as of React 18
// ReactDOM.render is deprecated, and the replacement, ReactDOM.createRoot is moved into a
// subpath import `react-dom/client`. That makes it hard for us to support multiple React versions.
// As a global API, we can't use portals without introducing a breaking API change. LiveAnnouncer
// is simple enough to implement without React, so that's what we do here.
// See this discussion for more details: https://github.com/reactwg/react-18/discussions/125#discussioncomment-2382638
class LiveAnnouncer {
  node: HTMLElement | null;
  assertiveLog: HTMLElement;
  politeLog: HTMLElement;

  constructor() {
    this.node = document.createElement("div");
    this.node.dataset.liveAnnouncer = "true";
    // copied from VisuallyHidden
    Object.assign(this.node.style, {
      border: 0,
      clip: "rect(0 0 0 0)",
      clipPath: "inset(50%)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap",
    });

    this.assertiveLog = this.createLog("assertive");
    this.node.appendChild(this.assertiveLog);

    this.politeLog = this.createLog("polite");
    this.node.appendChild(this.politeLog);

    document.body.prepend(this.node);
  }

  createLog(ariaLive: string): HTMLDivElement {
    const node = document.createElement("div");
    node.setAttribute("role", "log");
    node.setAttribute("aria-live", ariaLive);
    node.setAttribute("aria-relevant", "additions");
    return node;
  }

  destroy(): void {
    if (!this.node) {
      return;
    }

    document.body.removeChild(this.node);
    this.node = null;
  }

  announce(
    message: string,
    assertiveness = "assertive",
    timeout = LIVEREGION_TIMEOUT_DELAY
  ): void {
    if (!this.node) {
      return;
    }

    const node = document.createElement("div");
    node.textContent = message;

    if (assertiveness === "assertive") {
      this.assertiveLog.appendChild(node);
    } else {
      this.politeLog.appendChild(node);
    }

    if (message !== "") {
      setTimeout(() => {
        node.remove();
      }, timeout);
    }
  }

  clear(assertiveness: Assertiveness): void {
    if (!this.node) {
      return;
    }

    if (!assertiveness || assertiveness === "assertive") {
      this.assertiveLog.innerHTML = "";
    }

    if (!assertiveness || assertiveness === "polite") {
      this.politeLog.innerHTML = "";
    }
  }
}
