import { useCallback, useEffect } from "react";

export function useKeyDown(
  callback: (e?: string) => void,
  keys: string[]
): void {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
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
