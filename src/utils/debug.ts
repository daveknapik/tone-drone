/**
 * Centralized debug flag for audio/modulation subsystems.
 * To enable at runtime in dev tools:
 *   window.__DEBUG_AUDIO__ = true
 */

declare global {
  interface Window {
    __DEBUG_AUDIO__?: boolean;
  }
}

export const DEBUG_AUDIO =
  typeof window !== "undefined" &&
  typeof window.__DEBUG_AUDIO__ === "boolean"
    ? window.__DEBUG_AUDIO__
    : false;
