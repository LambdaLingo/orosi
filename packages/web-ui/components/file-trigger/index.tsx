import { type ForwardedRef, type ReactNode, forwardRef } from "react";
import { useObjectRef } from "hooks";
import { filterDOMProps } from "utilities";
import { Input } from "components/input";
import { PressResponder } from "components/press-responder";

export type FileTriggerProps = {
  /**
   * Specifies what mime type of files are allowed.
   */
  acceptedFileTypes?: string[];
  /**
   * Whether multiple files can be selected.
   */
  allowsMultiple?: boolean;
  /**
   * Specifies the use of a media capture mechanism to capture the media on the spot.
   */
  defaultCamera?: "user" | "environment";
  /**
   * Handler when a user selects a file.
   */
  onSelect?: (files: FileList | null) => void;
  /**
   * The children of the component.
   */
  children?: ReactNode;
  /**
   * Enables the selection of directories instead of individual files.
   */
  acceptDirectory?: boolean;
};

function FileTrigger(
  props: FileTriggerProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const {
    onSelect,
    acceptedFileTypes,
    allowsMultiple,
    defaultCamera,
    children,
    acceptDirectory,
    ...rest
  } = props;
  const inputRef = useObjectRef(ref);
  const domProps = filterDOMProps(rest);

  return (
    <>
      <PressResponder
        onPress={() => {
          if (inputRef.current.value) {
            inputRef.current.value = "";
          }
          inputRef.current?.click();
        }}
      >
        {children}
      </PressResponder>
      <Input
        {...domProps}
        accept={acceptedFileTypes?.toString()}
        capture={defaultCamera}
        onChange={(e) => onSelect?.(e.target.files)}
        ref={inputRef}
        style={{ display: "none" }}
        type="file"
        multiple={allowsMultiple}
        // @ts-expect-error
        webkitdirectory={acceptDirectory ? "" : undefined}
      />
    </>
  );
}

/**
 * A FileTrigger allows a user to access the file system with any pressable React Aria or React Spectrum component, or custom components built with usePress.
 */
const _FileTrigger = forwardRef(FileTrigger);
export { _FileTrigger as FileTrigger };
