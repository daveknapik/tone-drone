import { useState, useCallback, useImperativeHandle } from "react";
import PresetButton from "./PresetButton";
import PresetBrowserModal from "./PresetBrowserModal";
import ShareModal from "./ShareModal";
import { usePresetManager } from "../hooks/usePresetManager";
import { FACTORY_PRESETS, isFactoryPreset } from "../utils/factoryPresets";
import { extractPresetFromUrl } from "../utils/presetUrl";
import { deserializePreset } from "../utils/presetSerializer";
import type { DroneSynthHandle } from "./DroneSynth";
import type { Preset } from "../types/Preset";

export interface PresetManagerHandle {
  markAsModified: () => void;
}

interface PresetManagerProps {
  droneSynthRef: React.RefObject<DroneSynthHandle | null>;
  ref?: React.Ref<PresetManagerHandle>;
}

function PresetManager({ droneSynthRef, ref }: PresetManagerProps) {
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [presetToShare, setPresetToShare] = useState<Preset | null>(null);

  // Get refs from DroneSynth
  const refs = {
    oscillators: droneSynthRef.current?.oscillatorsRef ?? { current: null },
    polysynths: droneSynthRef.current?.polysynthsRef ?? { current: null },
    autoFilter: droneSynthRef.current?.autoFilterRef ?? { current: null },
    bitCrusher: droneSynthRef.current?.bitCrusherRef ?? { current: null },
    chebyshev: droneSynthRef.current?.chebyshevRef ?? { current: null },
    microlooper: droneSynthRef.current?.microlooperRef ?? { current: null },
    afterFilter: droneSynthRef.current?.afterFilterRef ?? { current: null },
    delay: droneSynthRef.current?.delayRef ?? { current: null },
    effectsBusSendRef: droneSynthRef.current?.effectsBusSendRef ?? {
      current: null,
    },
    bpmControl: droneSynthRef.current?.bpmControlRef ?? { current: null },
  };

  const presetManager = usePresetManager(refs);

  // Expose markAsModified to parent via ref
  useImperativeHandle(ref, () => ({
    markAsModified: () => setIsModified(true),
  }));

  const handleNew = useCallback(() => {
    if (confirm("Create new preset? Any unsaved changes will be lost.")) {
      presetManager.newPreset();
      setIsModified(false);
    }
  }, [presetManager]);

  const handleSave = useCallback(() => {
    if (!presetManager.currentPreset) {
      handleSaveAs();
      return;
    }

    if (isFactoryPreset(presetManager.currentPreset.metadata.id)) {
      alert("Factory presets cannot be overwritten. Use 'Save As...' instead.");
      handleSaveAs();
      return;
    }

    presetManager.updateCurrentPreset();
    setIsModified(false);
  }, [presetManager]);

  const handleSaveAs = useCallback(() => {
    const name = prompt("Enter preset name:");
    if (name) {
      presetManager.savePreset(name);
      setIsModified(false);
    }
  }, [presetManager]);

  const handleLoad = useCallback(
    (id: string, isFactory: boolean) => {
      if (
        isModified &&
        !confirm("Load preset? Any unsaved changes will be lost.")
      ) {
        return;
      }

      if (isFactory) {
        const preset = FACTORY_PRESETS.find((p) => p.metadata.id === id);
        if (preset) {
          presetManager.loadFactoryPreset(preset);
          setIsModified(false);
        }
      } else {
        presetManager.loadPreset(id);
        setIsModified(false);
      }
    },
    [presetManager, isModified]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("Delete this preset?")) {
        presetManager.deletePreset(id);
      }
    },
    [presetManager]
  );

  const handleShare = useCallback(() => {
    if (presetManager.currentPreset) {
      // Capture current state and create a temporary preset for sharing
      const currentState = presetManager.captureCurrentState();
      const tempPreset: Preset = {
        ...presetManager.currentPreset,
        state: currentState,
      };
      setPresetToShare(tempPreset);
      setIsShareOpen(true);
    }
  }, [presetManager]);

  const handleImportFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const preset = deserializePreset(json);
          presetManager.loadFactoryPreset(preset);
          setIsModified(false);
          alert(`Preset "${preset.metadata.name}" imported successfully!`);
        } catch (error) {
          alert(
            `Failed to import preset: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      };
      reader.readAsText(file);
      setIsBrowserOpen(false);
    },
    [presetManager]
  );

  const handleImportUrl = useCallback(
    (text: string) => {
      try {
        // Try as URL first
        let preset = extractPresetFromUrl(text);

        // If not a URL, try as JSON
        preset ??= deserializePreset(text);

        if (preset) {
          presetManager.loadFactoryPreset(preset);
          setIsModified(false);
          alert(`Preset "${preset.metadata.name}" imported successfully!`);
        } else {
          alert("Invalid preset URL or JSON");
        }
      } catch (error) {
        alert(
          `Failed to import preset: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
    [presetManager]
  );

  return (
    <>
      <PresetButton
        currentPreset={presetManager.currentPreset}
        isModified={isModified}
        factoryPresets={FACTORY_PRESETS}
        userPresets={presetManager.presetList}
        onNew={handleNew}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onLoad={handleLoad}
        onDelete={handleDelete}
        onShare={handleShare}
        onBrowseAll={() => setIsBrowserOpen(true)}
      />

      <PresetBrowserModal
        isOpen={isBrowserOpen}
        onClose={() => setIsBrowserOpen(false)}
        currentPreset={presetManager.currentPreset}
        factoryPresets={FACTORY_PRESETS}
        userPresets={presetManager.presetList}
        onLoad={handleLoad}
        onDelete={handleDelete}
        onImport={handleImportFile}
        onImportUrl={handleImportUrl}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        preset={presetToShare}
      />
    </>
  );
}

export default PresetManager;
