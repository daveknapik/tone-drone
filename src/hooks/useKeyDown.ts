import { useCallback, useEffect } from "react";

export function useKeyDown(
  callback: (e?: string) => void,
  keys: string[]
): void {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in a text input field
      const target = e.target as HTMLElement;
      const isTextInput =
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        (target.tagName === "INPUT" &&
          (target as HTMLInputElement).type === "text");

      if (isTextInput) {
        return;
      }

      const targetKeyPressed = keys.some((key) => e.key === key);

      if (targetKeyPressed) {
        e.preventDefault();
        callback(e.key);
      }
    },
    [callback, keys]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
}
