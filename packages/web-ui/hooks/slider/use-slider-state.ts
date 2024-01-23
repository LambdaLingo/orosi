import { useCallback, useMemo, useRef, useState } from "react";
import type { SliderProps, SliderState } from "types";
import { useControlledState } from "hooks";
import { clamp, snapValueToStep } from "utilities";

const DEFAULT_MIN_VALUE = 0;
const DEFAULT_MAX_VALUE = 100;
const DEFAULT_STEP_VALUE = 1;

export type SliderStateOptions<T> = {
  numberFormatter: Intl.NumberFormat;
} & SliderProps<T>;

/**
 * Provides state management for a slider component. Stores values for all thumbs,
 * formats values for localization, and provides methods to update the position
 * of any thumbs.
 * @param props
 */
export function useSliderState<T extends number | number[]>(
  props: SliderStateOptions<T>
): SliderState {
  const {
    isDisabled = false,
    minValue = DEFAULT_MIN_VALUE,
    maxValue = DEFAULT_MAX_VALUE,
    numberFormatter: formatter,
    step = DEFAULT_STEP_VALUE,
    orientation = "horizontal",
  } = props;

  // Page step should be at least equal to step and always a multiple of the step.
  const pageSize = useMemo(() => {
    let calcPageSize = (maxValue - minValue) / 10;
    calcPageSize = snapValueToStep(calcPageSize, 0, calcPageSize + step, step);
    return Math.max(calcPageSize, step);
  }, [step, maxValue, minValue]);

  const restrictValues = useCallback(
    (values: number[] | undefined) =>
      values?.map((val, idx) => {
        const min = idx === 0 ? minValue : values[idx - 1];
        const max = idx === values.length - 1 ? maxValue : values[idx + 1];
        return snapValueToStep(val, min, max, step);
      }),
    [minValue, maxValue, step]
  );

  const value: number[] | undefined = useMemo(
    () => restrictValues(convertValue(props.value)),
    [props.value, restrictValues]
  );
  const defaultValue = useMemo(
    () => restrictValues(convertValue(props.defaultValue) ?? [minValue]),
    [restrictValues, props.defaultValue, minValue]
  );
  const onChange = createOnChange(
    props.value,
    props.defaultValue,
    props.onChange as ((value: number | number[]) => void) | undefined
  );
  const onChangeEnd = createOnChange(
    props.value,
    props.defaultValue,
    props.onChangeEnd as ((value: number | number[]) => void) | undefined
  );

  const [values, setValuesState] = useControlledState<number[]>(
    value,
    defaultValue,
    onChange
  );
  const [isDraggings, setIsDraggings] = useState<boolean[]>(
    new Array(values.length).fill(false)
  );
  const isEditablesRef = useRef<boolean[]>(new Array(values.length).fill(true));
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(
    undefined
  );

  const valuesRef = useRef<number[]>(values);
  const isDraggingsRef = useRef<boolean[]>(isDraggings);
  const setValues = (values: number[]) => {
    valuesRef.current = values;
    setValuesState(values);
  };

  const setDraggings = (draggings: boolean[]) => {
    isDraggingsRef.current = draggings;
    setIsDraggings(draggings);
  };

  function getValuePercent(value: number): number {
    return (value - minValue) / (maxValue - minValue);
  }

  function getThumbMinValue(index: number): number {
    return index === 0 ? minValue : values[index - 1];
  }
  function getThumbMaxValue(index: number): number {
    return index === values.length - 1 ? maxValue : values[index + 1];
  }

  function isThumbEditable(index: number): boolean {
    return isEditablesRef.current[index];
  }

  function setThumbEditable(index: number, editable: boolean): void {
    isEditablesRef.current[index] = editable;
  }

  function updateValue(index: number, value: number): void {
    if (isDisabled || !isThumbEditable(index)) {
      return;
    }
    const thisMin = getThumbMinValue(index);
    const thisMax = getThumbMaxValue(index);

    // Round value to multiple of step, clamp value between min and max
    value = snapValueToStep(value, thisMin, thisMax, step);
    const newValues = replaceIndex(valuesRef.current, index, value);
    setValues(newValues);
  }

  function updateDragging(index: number, dragging: boolean): void {
    if (isDisabled || !isThumbEditable(index)) {
      return;
    }

    const wasDragging = isDraggingsRef.current[index];
    isDraggingsRef.current = replaceIndex(
      isDraggingsRef.current,
      index,
      dragging
    );
    setDraggings(isDraggingsRef.current);

    // Call onChangeEnd if no handles are dragging.
    if (onChangeEnd && wasDragging && !isDraggingsRef.current.some(Boolean)) {
      onChangeEnd(valuesRef.current);
    }
  }

  function getFormattedValue(value: number): string {
    return formatter.format(value);
  }

  function setThumbPercent(index: number, percent: number): void {
    updateValue(index, getPercentValue(percent));
  }

  function getRoundedValue(value: number): number {
    return Math.round((value - minValue) / step) * step + minValue;
  }

  function getPercentValue(percent: number): number {
    const val = percent * (maxValue - minValue) + minValue;
    return clamp(getRoundedValue(val), minValue, maxValue);
  }

  function incrementThumb(index: number, stepSize: number = 1): void {
    const s = Math.max(stepSize, step);
    updateValue(
      index,
      snapValueToStep(values[index] + s, minValue, maxValue, step)
    );
  }

  function decrementThumb(index: number, stepSize = 1): void {
    const s = Math.max(stepSize, step);
    updateValue(
      index,
      snapValueToStep(values[index] - s, minValue, maxValue, step)
    );
  }

  return {
    values,
    getThumbValue: (index: number) => values[index],
    setThumbValue: updateValue,
    setThumbPercent,
    isThumbDragging: (index: number) => isDraggings[index],
    setThumbDragging: updateDragging,
    focusedThumb: focusedIndex,
    setFocusedThumb: setFocusedIndex,
    getThumbPercent: (index: number) => getValuePercent(values[index]),
    getValuePercent,
    getThumbValueLabel: (index: number) => getFormattedValue(values[index]),
    getFormattedValue,
    getThumbMinValue,
    getThumbMaxValue,
    getPercentValue,
    isThumbEditable,
    setThumbEditable,
    incrementThumb,
    decrementThumb,
    step,
    pageSize,
    orientation,
    isDisabled,
  };
}

function replaceIndex<T>(array: T[], index: number, value: T): T[] {
  if (array[index] === value) {
    return array;
  }

  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

function convertValue(
  value: number | number[] | undefined | null
): number[] | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

function createOnChange(
  value?: number | number[],
  defaultValue?: number | number[],
  onChange?: (value: number | number[]) => void
) {
  return (newValue: number[]) => {
    if (typeof value === "number" || typeof defaultValue === "number") {
      onChange?.(newValue[0]);
    } else {
      onChange?.(newValue);
    }
  };
}
