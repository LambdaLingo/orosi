import { type Dispatch, useRef, useState } from "react";
import { useLayoutEffect } from "./use-layout-effect";
import { useEffectEvent } from "./use-effect-event";

type SetValueAction<S> = (prev: S) => Generator<any, void, unknown>;

// This hook works like `useState`, but when setting the value, you pass a generator function
// that can yield multiple values. Each yielded value updates the state and waits for the next
// layout effect, then continues the generator. This allows sequential updates to state to be
// written linearly.
export function useValueEffect<S>(
  defaultValue: S | (() => S)
): [S, Dispatch<SetValueAction<S>>] {
  const [value, setValue] = useState(defaultValue);
  const effect = useRef<Generator<any, void, unknown> | null>(null);

  // Store the function in a ref so we can always access the current version
  // which has the proper `value` in scope.
  const nextRef = useEffectEvent(() => {
    // Run the generator to the next yield.
    if (effect.current) {
      const newValue = effect.current.next();

      // If the generator is done, reset the effect.
      if (newValue.done) {
        effect.current = null;
        return;
      }

      // If the value is the same as the current value,
      // then continue to the next yield. Otherwise,
      // set the value in state and wait for the next layout effect.
      if (value === newValue.value) {
        nextRef();
      } else {
        setValue(newValue.value);
      }
    }
  });

  useLayoutEffect(() => {
    // If there is an effect currently running, continue to the next yield.
    if (effect.current) {
      nextRef();
    }
  });

  const queue = useEffectEvent((fn: SetValueAction<S>) => {
    effect.current = fn(value);
    nextRef();
  });

  return [value, queue];
}
