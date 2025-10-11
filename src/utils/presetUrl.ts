import type { Preset } from "../types/Preset";
import { serializePreset, deserializePreset } from "./presetSerializer";

/**
 * Encode a preset to a URL-safe base64 string
 * Uses base64url encoding (RFC 4648 §5) which replaces +/ with -_ and removes padding
 */
export function encodePresetToUrl(preset: Preset): string {
  const json = serializePreset(preset);
  // Use btoa for base64 encoding in browser
  const base64 = btoa(json);
  // Convert to URL-safe base64
  const urlSafe = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return urlSafe;
}

/**
 * Decode a URL-safe base64 string to a preset
 * @throws Error if the string cannot be decoded or is not a valid preset
 */
export function decodePresetFromUrl(encoded: string): Preset {
  try {
    // Convert from URL-safe base64 back to standard base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    const padding = base64.length % 4;
    if (padding > 0) {
      base64 += "=".repeat(4 - padding);
    }

    // Decode from base64
    const json = atob(base64);

    // Parse and validate preset
    return deserializePreset(json);
  } catch (error) {
    throw new Error(
      `Failed to decode preset from URL: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

/**
 * Extract a preset from a URL's query string
 * Looks for a 'preset' parameter and decodes it
 * If no URL is provided, uses window.location.href
 * @returns The decoded preset, or null if no valid preset is found
 */
export function extractPresetFromUrl(url?: string): Preset | null {
  try {
    const urlToUse = url ?? window.location.href;
    const urlObj = new URL(urlToUse);
    const presetParam = urlObj.searchParams.get("preset");

    if (!presetParam) {
      return null;
    }

    return decodePresetFromUrl(presetParam);
  } catch (error) {
    console.error("Failed to extract preset from URL:", error);
    return null;
  }
}

/**
 * Check if a URL contains a valid preset parameter
 */
export function isValidPresetUrl(url: string): boolean {
  try {
    const preset = extractPresetFromUrl(url);
    return preset !== null;
  } catch {
    return false;
  }
}

/**
 * Create a shareable URL with the preset encoded in the query string
 * @param preset The preset to encode
 * @param baseUrl The base URL (defaults to current location)
 * @returns Complete URL with preset parameter
 */
export function createShareableUrl(preset: Preset, baseUrl?: string): string {
  const encoded = encodePresetToUrl(preset);
  const base = baseUrl ?? window.location.origin + window.location.pathname;
  const url = new URL(base);
  url.searchParams.set("preset", encoded);
  return url.toString();
}
