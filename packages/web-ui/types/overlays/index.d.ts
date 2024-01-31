import type {
  HTMLAttributes,
  MutableRefObject,
  ReactElement,
  ReactNode,
} from "react";

export type Placement =
  | "bottom"
  | "bottom left"
  | "bottom right"
  | "bottom start"
  | "bottom end"
  | "top"
  | "top left"
  | "top right"
  | "top start"
  | "top end"
  | "left"
  | "left top"
  | "left bottom"
  | "start"
  | "start top"
  | "start bottom"
  | "right"
  | "right top"
  | "right bottom"
  | "end"
  | "end top"
  | "end bottom";

export type Axis = "top" | "bottom" | "left" | "right";
export type SizeAxis = "width" | "height";
export type PlacementAxis = Axis | "center";

export type PositionProps = {
  /**
   * The placement of the element with respect to its anchor element.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * The placement padding that should be applied between the element and its
   * surrounding container.
   * @default 12
   */
  containerPadding?: number;
  /**
   * The additional offset applied along the main axis between the element and its
   * anchor element.
   * @default 0
   */
  offset?: number;
  /**
   * The additional offset applied along the cross axis between the element and its
   * anchor element.
   * @default 0
   */
  crossOffset?: number;
  /**
   * Whether the element should flip its orientation (e.g. top to bottom or left to right) when
   * there is insufficient room for it to render completely.
   * @default true
   */
  shouldFlip?: boolean;
  // /**
  //  * The element that should be used as the bounding container when calculating container offset
  //  * or whether it should flip.
  //  */
  // boundaryElement?: Element,
  /** Whether the element is rendered. */
  isOpen?: boolean;
};

export type OverlayProps = {
  children: ReactNode;
  isOpen?: boolean;
  container?: Element;
  isKeyboardDismissDisabled?: boolean;
  onEnter?: () => void;
  onEntering?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExiting?: () => void;
  onExited?: () => void;
  nodeRef: MutableRefObject<HTMLElement>;
  disableFocusManagement?: boolean;
};

export type ModalProps = {
  children: ReactElement;
  isOpen?: boolean;
  onClose?: () => void;
  type?: "modal" | "fullscreen" | "fullscreenTakeover";
  isDismissable?: boolean;
} & Omit<OverlayProps, "nodeRef">;

export type PopoverProps = {
  children: ReactNode;
  placement?: PlacementAxis;
  arrowProps?: HTMLAttributes<HTMLElement>;
  hideArrow?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  shouldCloseOnBlur?: boolean;
  isNonModal?: boolean;
  isDismissable?: boolean;
} & Omit<OverlayProps, "nodeRef">;

export type TrayProps = {
  children: ReactElement;
  isOpen?: boolean;
  onClose?: () => void;
  shouldCloseOnBlur?: boolean;
  isFixedHeight?: boolean;
  isNonModal?: boolean;
} & Omit<OverlayProps, "nodeRef">;

export type OverlayTriggerProps = {
  /** Whether the overlay is open by default (controlled). */
  isOpen?: boolean;
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler that is called when the overlay's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
};

export type OverlayTriggerState = {
  /** Whether the overlay is currently open. */
  readonly isOpen: boolean;
  /** Sets whether the overlay is open. */
  setOpen: (isOpen: boolean) => void;
  /** Opens the overlay. */
  open: () => void;
  /** Closes the overlay. */
  close: () => void;
  /** Toggles the overlay's visibility. */
  toggle: () => void;
};
