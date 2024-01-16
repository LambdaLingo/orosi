import { createContext } from "react";
import type { ValidationErrors } from "types";

export const FormValidationContext = createContext<ValidationErrors>({});
