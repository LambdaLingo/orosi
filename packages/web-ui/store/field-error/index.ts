import { createContext } from "react";
import type { ValidationResult } from "types";

export const FieldErrorContext = createContext<ValidationResult | null>(null);
