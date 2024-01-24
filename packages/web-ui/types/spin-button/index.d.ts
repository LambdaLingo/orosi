import type {
  InputBase,
  RangeInputBase,
  Validation,
  ValueBase,
} from "types/shared";

export type SpinButtonProps = {
  textValue: string;
  onIncrement: () => void;
  onIncrementPage?: () => void;
  onDecrement: () => void;
  onDecrementPage?: () => void;
  onDecrementToMin?: () => void;
  onIncrementToMax?: () => void;
} & InputBase &
  Validation<number> &
  ValueBase<number> &
  RangeInputBase<number>;

export type SpinbuttonAria = {
  spinButtonProps: DOMAttributes;
  incrementButtonProps: ButtonProps;
  decrementButtonProps: ButtonProps;
};
