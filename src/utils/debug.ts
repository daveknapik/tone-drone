export const DEBUG_AUDIO =
  typeof window !== "undefined" &&
  typeof (window as unknown as { __DEBUG_AUDIO__?: boolean }).__DEBUG_AUDIO__ === "boolean"
    ? (window as unknown as { __DEBUG_AUDIO__?: boolean }).__DEBUG_AUDIO__!
    : false;

/**
 * Centralized debug flag for audio/modulation subsystems
 *
 * Set to true to enable verbose logging for:
 * - Modulation routing and connections
 * - Control-rate parameter updates
 * - Audio graph connection management
 *
 * Should be false in production builds.
 */
export const DEBUG_AUDIO = false;
