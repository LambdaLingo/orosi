/**
 * Takes a value and forces it to the closest min/max if it's outside. Also forces it to the closest valid step.
 */
export function clamp(
  value: number,
  min: number = -Infinity,
  max: number = Infinity
): number {
  let newValue = Math.min(Math.max(value, min), max);
  return newValue;
}

export function snapValueToStep(
  value: number,
  min: number | undefined,
  max: number | undefined,
  step: number
): number {
  min = Number(min);
  max = Number(max);
  let remainder = (value - (isNaN(min) ? 0 : min)) % step;
  let snappedValue =
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder;

  if (!isNaN(min)) {
    if (snappedValue < min) {
      snappedValue = min;
    } else if (!isNaN(max) && snappedValue > max) {
      snappedValue = min + Math.floor((max - min) / step) * step;
    }
  } else if (!isNaN(max) && snappedValue > max) {
    snappedValue = Math.floor(max / step) * step;
  }

  // correct floating point behavior by rounding to step precision
  let string = step.toString();
  let index = string.indexOf(".");
  let precision = index >= 0 ? string.length - index : 0;

  if (precision > 0) {
    let pow = Math.pow(10, precision);
    snappedValue = Math.round(snappedValue * pow) / pow;
  }

  return snappedValue;
}

/* Takes a value and rounds off to the number of digits. */
export function toFixedNumber(
  value: number,
  digits: number,
  base: number = 10
): number {
  const pow = Math.pow(base, digits);

  return Math.round(value * pow) / pow;
}
