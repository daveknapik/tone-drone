import { useCallback, useEffect, useRef, useState } from "react";
import type { Preset, PresetListItem } from "../types/Preset";
import type { OscillatorsHandle } from "../types/OscillatorsParams";
import type { PolySynthsHandle } from "../components/Polysynths";
import type { AutoFilterHandle } from "../types/AutoFilterParams";
import type { BitCrusherHandle } from "../types/BitCrusherParams";
import type { ChebyshevHandle } from "../types/ChebyshevParams";
import type { DelayHandle } from "../types/DelayParams";
import type { FilterHandle } from "../types/FilterParams";
import type { EffectsBusSendHandle } from "../components/EffectsBusSendControl";
import type { BpmControlHandle } from "../types/BpmParams";

import {
  savePreset as savePresetToStorage,
  loadPreset as loadPresetFromStorage,
  deletePreset as deletePresetFromStorage,
  listPresets as listPresetsFromStorage,
} from "../utils/presetStorage";
import { createPreset, updatePresetTimestamp } from "../utils/presetSerializer";
import { extractPresetFromUrl } from "../utils/presetUrl";
import { DEFAULT_BPM } from "../utils/presetDefaults";

/**
 * Refs to all components that expose state via imperative handles
 */
export interface PresetComponentRefs {
  oscillators: React.RefObject<OscillatorsHandle | null>;
  polysynths: React.RefObject<PolySynthsHandle | null>;
  autoFilter: React.RefObject<AutoFilterHandle | null>;
  bitCrusher: React.RefObject<BitCrusherHandle | null>;
  chebyshev: React.RefObject<ChebyshevHandle | null>;
  microlooper: React.RefObject<DelayHandle | null>;
  afterFilter: React.RefObject<FilterHandle | null>;
  delay: React.RefObject<DelayHandle | null>;
  effectsBusSendRef: React.RefObject<EffectsBusSendHandle | null>;
  bpmControl: React.RefObject<BpmControlHandle | null>;
}

/**
 * Hook for managing presets (save, load, delete, list)
 * Uses imperative handles to read/write component state
 */
export function usePresetManager(refs: PresetComponentRefs) {
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [presetList, setPresetList] = useState<PresetListItem[]>([]);

  // Load preset list on mount
  useEffect(() => {
    refreshPresetList();
  }, []);

  // Store URL preset extracted on mount
  const [pendingUrlPreset, setPendingUrlPreset] = useState<Preset | null>(null);
  const urlPresetApplied = useRef(false);

  // Extract URL preset once on mount
  useEffect(() => {
    const urlPreset = extractPresetFromUrl();
    if (urlPreset) {
      setPendingUrlPreset(urlPreset);
    }
  }, []);

  // Apply URL preset when critical refs are ready
  // This effect runs on every render and will apply the preset once refs are available
  useEffect(() => {
    if (
      pendingUrlPreset &&
      !urlPresetApplied.current &&
      refs.oscillators.current &&
      refs.polysynths.current &&
      refs.bpmControl.current &&
      refs.effectsBusSendRef.current
    ) {
      applyPreset(pendingUrlPreset);
      setCurrentPreset(pendingUrlPreset);
      urlPresetApplied.current = true;
      setPendingUrlPreset(null); // Clear pending preset after applying
    }
  });

  /**
   * Refresh the list of available presets
   */
  const refreshPresetList = useCallback(() => {
    const list = listPresetsFromStorage();
    setPresetList(list);
  }, []);

  /**
   * Gather current state from all components
   */
  const captureCurrentState = useCallback(() => {
    const oscillatorsState = refs.oscillators.current?.getState();
    const polysynthsState = refs.polysynths.current?.getState();
    const autoFilterParams = refs.autoFilter.current?.getParams();
    const bitCrusherParams = refs.bitCrusher.current?.getParams();
    const chebyshevParams = refs.chebyshev.current?.getParams();
    const microlooperParams = refs.microlooper.current?.getParams();
    const afterFilterParams = refs.afterFilter.current?.getParams();
    const delayParams = refs.delay.current?.getParams();
    const effectsBusSend = refs.effectsBusSendRef.current?.value ?? 0;
    const bpm = refs.bpmControl.current?.getValue() ?? DEFAULT_BPM;

    if (
      !oscillatorsState ||
      !polysynthsState ||
      !autoFilterParams ||
      !bitCrusherParams ||
      !chebyshevParams ||
      !microlooperParams ||
      !afterFilterParams ||
      !delayParams
    ) {
      throw new Error("Cannot capture state: some component refs are not available");
    }

    return {
      oscillators: oscillatorsState,
      polysynths: polysynthsState,
      effects: {
        autoFilter: autoFilterParams,
        bitCrusher: bitCrusherParams,
        chebyshev: chebyshevParams,
        microlooper: microlooperParams,
        afterFilter: afterFilterParams,
        delay: delayParams,
      },
      effectsBusSend,
      bpm,
    };
  }, [refs]);

  /**
   * Apply a preset's state to all components
   */
  const applyPreset = useCallback(
    (preset: Preset) => {
      const { state } = preset;

      // Apply oscillators state
      refs.oscillators.current?.setState(state.oscillators);

      // Apply polysynths state (migration ensures this always exists)
      refs.polysynths.current?.setState(state.polysynths);

      // Apply effects state
      refs.autoFilter.current?.setParams(state.effects.autoFilter);
      refs.bitCrusher.current?.setParams(state.effects.bitCrusher);
      refs.chebyshev.current?.setParams(state.effects.chebyshev);
      refs.microlooper.current?.setParams(state.effects.microlooper);
      refs.afterFilter.current?.setParams(state.effects.afterFilter);
      refs.delay.current?.setParams(state.effects.delay);

      // Apply effects bus send
      if (refs.effectsBusSendRef.current) {
        refs.effectsBusSendRef.current.setValue(state.effectsBusSend);
      }

      // Apply BPM directly if ref is available
      // For URL presets, the ref-waiting logic above ensures refs are ready before calling applyPreset
      // For user/factory preset loads, refs should already be initialized
      if (refs.bpmControl.current) {
        refs.bpmControl.current.setValue(state.bpm);
      }
    },
    [refs]
  );

  /**
   * Save current state as a new preset
   */
  const savePreset = useCallback(
    (name: string): Preset => {
      const state = captureCurrentState();
      const preset = createPreset(name, state);
      savePresetToStorage(preset);
      refreshPresetList();
      setCurrentPreset(preset);
      return preset;
    },
    [captureCurrentState, refreshPresetList]
  );

  /**
   * Update the current preset with current state
   */
  const updateCurrentPreset = useCallback(() => {
    if (!currentPreset) {
      throw new Error("No preset is currently loaded");
    }

    const state = captureCurrentState();
    const updated = updatePresetTimestamp({
      ...currentPreset,
      state,
    });

    savePresetToStorage(updated);
    refreshPresetList();
    setCurrentPreset(updated);
    return updated;
  }, [currentPreset, captureCurrentState, refreshPresetList]);

  /**
   * Load a preset by ID and apply it
   */
  const loadPreset = useCallback(
    (id: string): Preset | null => {
      const preset = loadPresetFromStorage(id);
      if (preset) {
        applyPreset(preset);
        setCurrentPreset(preset);
      }
      return preset;
    },
    [applyPreset]
  );

  /**
   * Delete a preset by ID
   */
  const deletePreset = useCallback(
    (id: string) => {
      deletePresetFromStorage(id);
      refreshPresetList();
      if (currentPreset?.metadata.id === id) {
        setCurrentPreset(null);
      }
    },
    [currentPreset, refreshPresetList]
  );

  /**
   * Create a new preset (clear current state)
   */
  const newPreset = useCallback(() => {
    setCurrentPreset(null);
    // Optionally reset to default state here
  }, []);

  /**
   * Load and set a factory preset (doesn't save to storage)
   */
  const loadFactoryPreset = useCallback(
    (preset: Preset) => {
      applyPreset(preset);
      setCurrentPreset(preset);
    },
    [applyPreset]
  );

  return {
    // State
    currentPreset,
    presetList,

    // Actions
    savePreset,
    updateCurrentPreset,
    loadPreset,
    loadFactoryPreset,
    deletePreset,
    newPreset,
    captureCurrentState,
    applyPreset,
    refreshPresetList,
  };
}
