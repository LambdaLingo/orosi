import { useEffectEvent } from "hooks/shared";
import { type RefObject, useEffect, useRef } from "react";

export function useFormReset<T>(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  initialValue: T,
  onReset: (value: T) => void
): void {
  const resetValue = useRef(initialValue);
  const handleReset = useEffectEvent(() => {
    if (onReset) {
      onReset(resetValue.current);
    }
  });

  useEffect(() => {
    const form = ref?.current?.form;
    form?.addEventListener("reset", handleReset);
    return () => {
      form?.removeEventListener("reset", handleReset);
    };
  }, [ref, handleReset]);
}
