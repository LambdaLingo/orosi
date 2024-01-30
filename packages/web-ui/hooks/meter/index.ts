import type { DOMAttributes, AriaMeterProps } from "types";
import { useProgressBar } from "hooks";

export type MeterAria = {
  /** Props for the meter container element. */
  meterProps: DOMAttributes;
  /** Props for the meter's visual label (if any). */
  labelProps: DOMAttributes;
};

/**
 * Provides the accessibility implementation for a meter component.
 * Meters represent a quantity within a known range, or a fractional value.
 */
export function useMeter(props: AriaMeterProps): MeterAria {
  const { progressBarProps, labelProps } = useProgressBar(props);

  return {
    meterProps: {
      ...progressBarProps,
      // Use the meter role if available, but fall back to progressbar if not
      // Chrome currently falls back from meter automatically, and Firefox
      // does not support meter at all. Safari 13+ seems to support meter properly.
      // https://bugs.chromium.org/p/chromium/issues/detail?id=944542
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1460378
      role: "meter progressbar",
    },
    labelProps,
  };
}
