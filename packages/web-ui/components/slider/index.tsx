import {
  type ForwardedRef,
  type HTMLAttributes,
  type OutputHTMLAttributes,
  type RefObject,
  createContext,
  forwardRef,
  useContext,
  useRef,
} from "react";
import type {
  AriaSliderProps,
  AriaSliderThumbProps,
  SliderState,
  RenderChildren,
  SlotProps,
  ForwardRefType,
  HoverEvents,
  Orientation,
  ContextValue,
} from "types";
import { LabelContext } from "store";
import {
  useContextProps,
  useRenderChildren,
  useSlot,
  useSlottedContext,
  useFocusRing,
  useHover,
  useNumberFormatter,
  useSlider,
  useSliderThumb,
  useSliderState,
} from "hooks";
import { filterDOMProps, mergeProps } from "utilities";
import { Provider } from "components/provider";
import { VisuallyHidden } from "components/visually-hidden";

export interface SliderProps<T = number | number[]>
  extends Omit<AriaSliderProps<T>, "label">,
    RenderChildren<SliderRenderProps>,
    SlotProps {
  /**
   * The display format of the value label.
   */
  formatOptions?: Intl.NumberFormatOptions;
}

export const SliderContext =
  createContext<ContextValue<SliderProps, HTMLDivElement>>(null);
export const SliderStateContext = createContext<SliderState | null>(null);
export const SliderTrackContext =
  createContext<ContextValue<SliderTrackContextValue, HTMLDivElement>>(null);
export const SliderOutputContext =
  createContext<ContextValue<SliderOutputContextValue, HTMLOutputElement>>(
    null
  );

export interface SliderRenderProps {
  /**
   * The orientation of the slider.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation;
  /**
   * Whether the slider is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * State of the slider.
   */
  state: SliderState;
}

function Slider<T extends number | number[]>(
  props: SliderProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, SliderContext);
  let trackRef = useRef<HTMLDivElement>(null);
  let numberFormatter = useNumberFormatter(props.formatOptions);
  let state = useSliderState({ ...props, numberFormatter });
  let [labelRef, label] = useSlot();
  let { groupProps, trackProps, labelProps, outputProps } = useSlider(
    { ...props, label },
    state,
    trackRef
  );

  let RenderChildren = useRenderChildren({
    ...props,
    values: {
      orientation: state.orientation,
      isDisabled: state.isDisabled,
      state,
    },
    defaultClassName: "react-aria-Slider",
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [SliderStateContext, state],
        [SliderTrackContext, { ...trackProps, ref: trackRef }],
        [SliderOutputContext, outputProps],
        [LabelContext, { ...labelProps, ref: labelRef }],
      ]}
    >
      <div
        {...DOMProps}
        {...groupProps}
        {...RenderChildren}
        ref={ref}
        slot={props.slot || undefined}
        data-orientation={state.orientation}
        data-disabled={state.isDisabled || undefined}
      />
    </Provider>
  );
}

/**
 * A slider allows a user to select one or more values within a range.
 */
const _Slider = /*#__PURE__*/ (forwardRef as ForwardRefType)(Slider);
export { _Slider as Slider };

export interface SliderOutputProps extends RenderChildren<SliderRenderProps> {}
interface SliderOutputContextValue
  extends Omit<
      OutputHTMLAttributes<HTMLOutputElement>,
      "children" | "className" | "style"
    >,
    SliderOutputProps {}

function SliderOutput(
  props: SliderOutputProps,
  ref: ForwardedRef<HTMLOutputElement>
) {
  [props, ref] = useContextProps(props, ref, SliderOutputContext);
  let { children, style, className, ...otherProps } = props;
  let state = useContext(SliderStateContext)!;
  let RenderChildren = useRenderChildren({
    className,
    style,
    children,
    defaultChildren: state.getThumbValueLabel(0),
    defaultClassName: "react-aria-SliderOutput",
    values: {
      orientation: state.orientation,
      isDisabled: state.isDisabled,
      state,
    },
  });

  return (
    <output
      {...otherProps}
      {...RenderChildren}
      ref={ref}
      data-orientation={state.orientation || undefined}
      data-disabled={state.isDisabled || undefined}
    />
  );
}

/**
 * A slider output displays the current value of a slider as text.
 */
const _SliderOutput = /*#__PURE__*/ (forwardRef as ForwardRefType)(
  SliderOutput
);
export { _SliderOutput as SliderOutput };

export interface SliderTrackRenderProps extends SliderRenderProps {
  /**
   * Whether the slider track is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
}

export interface SliderTrackProps
  extends HoverEvents,
    RenderChildren<SliderTrackRenderProps> {}
interface SliderTrackContextValue
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style">,
    SliderTrackProps {}

function SliderTrack(
  props: SliderTrackProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, SliderTrackContext);
  let state = useContext(SliderStateContext)!;
  let { onHoverStart, onHoverEnd, onHoverChange, ...otherProps } = props;
  let { hoverProps, isHovered } = useHover({
    onHoverStart,
    onHoverEnd,
    onHoverChange,
  });
  let RenderChildren = useRenderChildren({
    ...props,
    defaultClassName: "react-aria-SliderTrack",
    values: {
      orientation: state.orientation,
      isDisabled: state.isDisabled,
      isHovered,
      state,
    },
  });

  return (
    <div
      {...mergeProps(otherProps, hoverProps)}
      {...RenderChildren}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-orientation={state.orientation || undefined}
      data-disabled={state.isDisabled || undefined}
    />
  );
}

/**
 * A slider track is a container for one or more slider thumbs.
 */
const _SliderTrack = /*#__PURE__*/ (forwardRef as ForwardRefType)(SliderTrack);
export { _SliderTrack as SliderTrack };

export interface SliderThumbRenderProps {
  /**
   * State of the slider.
   */
  state: SliderState;
  /**
   * Whether this thumb is currently being dragged.
   * @selector [data-dragging]
   */
  isDragging: boolean;
  /**
   * Whether the thumb is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the thumb is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the thumb is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the thumb is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean;
}

export interface SliderThumbProps
  extends Omit<AriaSliderThumbProps, "label" | "validationState">,
    HoverEvents,
    RenderChildren<SliderThumbRenderProps> {}

function SliderThumb(
  props: SliderThumbProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let state = useContext(SliderStateContext)!;
  let { ref: trackRef } = useSlottedContext(SliderTrackContext)!;
  let { index = 0 } = props;
  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let {
    thumbProps,
    inputProps,
    labelProps,
    isDragging,
    isFocused,
    isDisabled,
  } = useSliderThumb(
    {
      ...props,
      index,
      trackRef: trackRef as RefObject<HTMLDivElement>,
      inputRef,
      label,
    },
    state
  );

  let { focusProps, isFocusVisible } = useFocusRing();
  let { hoverProps, isHovered } = useHover(props);

  let RenderChildren = useRenderChildren({
    ...props,
    defaultClassName: "react-aria-SliderThumb",
    values: {
      state,
      isHovered,
      isDragging,
      isFocused,
      isFocusVisible,
      isDisabled,
    },
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...mergeProps(DOMProps, thumbProps, hoverProps)}
      {...RenderChildren}
      ref={ref}
      style={{ ...thumbProps.style, ...RenderChildren.style }}
      data-hovered={isHovered || undefined}
      data-dragging={isDragging || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
    >
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
      <Provider values={[[LabelContext, { ...labelProps, ref: labelRef }]]}>
        {RenderChildren.children}
      </Provider>
    </div>
  );
}

/**
 * A slider thumb represents an individual value that the user can adjust within a slider track.
 */
const _SliderThumb = /*#__PURE__*/ (forwardRef as ForwardRefType)(SliderThumb);
export { _SliderThumb as SliderThumb };
