import type { Preset, PresetListItem } from "../types/Preset";
import { serializePreset, deserializePreset } from "./presetSerializer";

const PRESET_KEY_PREFIX = "preset_";
const PRESET_INDEX_KEY = "preset_index";

/**
 * Get the localStorage key for a preset
 */
function getPresetKey(id: string): string {
  return `${PRESET_KEY_PREFIX}${id}`;
}

/**
 * Load the preset index from localStorage
 */
function loadIndex(): PresetListItem[] {
  try {
    const indexJson = localStorage.getItem(PRESET_INDEX_KEY);
    if (!indexJson) {
      return [];
    }
    return JSON.parse(indexJson) as PresetListItem[];
  } catch (error) {
    console.error("Failed to load preset index:", error);
    return [];
  }
}

/**
 * Save the preset index to localStorage
 */
function saveIndex(index: PresetListItem[]): void {
  try {
    localStorage.setItem(PRESET_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error("Failed to save preset index:", error);
    throw new Error("Failed to save preset index");
  }
}

/**
 * Add or update a preset in the index
 */
function updateIndex(preset: Preset): void {
  const index = loadIndex();
  const existingIndex = index.findIndex((p) => p.id === preset.metadata.id);

  const listItem: PresetListItem = {
    id: preset.metadata.id,
    name: preset.metadata.name,
    created: preset.metadata.created,
    modified: preset.metadata.modified,
  };

  if (existingIndex >= 0) {
    index[existingIndex] = listItem;
  } else {
    index.push(listItem);
  }

  saveIndex(index);
}

/**
 * Remove a preset from the index
 */
function removeFromIndex(id: string): void {
  const index = loadIndex();
  const filtered = index.filter((p) => p.id !== id);
  saveIndex(filtered);
}

/**
 * Save a preset to localStorage
 */
export function savePreset(preset: Preset): void {
  try {
    const key = getPresetKey(preset.metadata.id);
    const serialized = serializePreset(preset);
    localStorage.setItem(key, serialized);
    updateIndex(preset);
  } catch (error) {
    console.error("Failed to save preset:", error);
    throw new Error(
      `Failed to save preset: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

/**
 * Load a preset from localStorage
 * Returns null if preset does not exist or is invalid
 */
export function loadPreset(id: string): Preset | null {
  try {
    const key = getPresetKey(id);
    const serialized = localStorage.getItem(key);

    if (!serialized) {
      return null;
    }

    return deserializePreset(serialized);
  } catch (error) {
    console.error("Failed to load preset:", error);
    return null;
  }
}

/**
 * Delete a preset from localStorage
 */
export function deletePreset(id: string): void {
  try {
    const key = getPresetKey(id);
    localStorage.removeItem(key);
    removeFromIndex(id);
  } catch (error) {
    console.error("Failed to delete preset:", error);
    throw new Error(
      `Failed to delete preset: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

/**
 * List all presets (returns metadata only)
 * Sorted by creation date (newest first)
 */
export function listPresets(): PresetListItem[] {
  const index = loadIndex();
  return index.sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();
    return dateB - dateA; // newest first
  });
}

/**
 * Check if a preset exists
 */
export function presetExists(id: string): boolean {
  const key = getPresetKey(id);
  return localStorage.getItem(key) !== null;
}

/**
 * Clear all presets from localStorage (useful for testing/reset)
 */
export function clearAllPresets(): void {
  try {
    const index = loadIndex();
    index.forEach((preset) => {
      const key = getPresetKey(preset.id);
      localStorage.removeItem(key);
    });
    localStorage.removeItem(PRESET_INDEX_KEY);
  } catch (error) {
    console.error("Failed to clear presets:", error);
    throw new Error("Failed to clear presets");
  }
}
