import type { ReactElement, ReactNode } from "react";
import type { Key } from "types/shared";

export type PartialNode<T> = {
  type?: string;
  key?: Key;
  value?: T;
  element?: ReactElement;
  wrapper?: (element: ReactElement) => ReactElement;
  rendered?: ReactNode;
  textValue?: string;
  "aria-label"?: string;
  index?: number;
  renderer?: (item: T) => ReactElement;
  hasChildNodes?: boolean;
  childNodes?: () => IterableIterator<PartialNode<T>>;
  props?: any;
  shouldInvalidate?: (context: unknown) => boolean;
};
