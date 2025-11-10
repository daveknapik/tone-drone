/**
 * Centralized debug flag for audio/modulation subsystems.
 * To enable at runtime in dev tools:
 *   window.__DEBUG_AUDIO__ = true
 */
export const DEBUG_AUDIO =
  typeof window !== "undefined" &&
  typeof (window as unknown as { __DEBUG_AUDIO__?: boolean }).__DEBUG_AUDIO__ === "boolean"
    ? (window as unknown as { __DEBUG_AUDIO__?: boolean }).__DEBUG_AUDIO__!
    : false;
