import type { SliderState } from "types";
import { sliderData } from "store";

export function getSliderThumbId(state: SliderState, index: number): string {
  const data = sliderData.get(state);
  if (!data) {
    throw new Error("Unknown slider state");
  }

  return `${data.id}-${index}`;
}
