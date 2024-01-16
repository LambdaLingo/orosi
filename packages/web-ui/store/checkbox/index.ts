import type { CheckboxGroupState } from "types";

type CheckboxGroupData = {
  name?: string;
  descriptionId?: string;
  errorMessageId?: string;
  validationBehavior: "aria" | "native";
};

export const checkboxGroupData = new WeakMap<
  CheckboxGroupState,
  CheckboxGroupData
>();
