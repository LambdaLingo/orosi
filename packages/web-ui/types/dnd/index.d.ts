export type DraggableItemProps = {
  /** The key of the draggable item within the collection. */
  key: Key;
  /**
   * Whether the item has an explicit focusable drag affordance to initiate accessible drag and drop mode.
   * If true, the dragProps will omit these event handlers, and they will be applied to dragButtonProps instead.
   */
  hasDragButton?: boolean;
  /**
   * Whether the item has a primary action (e.g. Enter key or long press) that would
   * conflict with initiating accessible drag and drop. If true, the Alt key must be held to
   * start dragging with a keyboard, and long press is disabled until selection mode is entered.
   * This should be passed from the associated collection item hook (e.g. useOption, useGridListItem, etc.).
   */
  hasAction?: boolean;
};

export type DraggableItemResult = {
  /** Props for the draggable item. */
  dragProps: HTMLAttributes<HTMLElement>;
  /** Props for the explicit drag button affordance, if any. */
  dragButtonProps: AriaButtonProps;
};
