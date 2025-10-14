import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import type { Preset, PresetListItem } from "../types/Preset";

interface PresetButtonProps {
  currentPreset: Preset | null;
  isModified: boolean;
  factoryPresets: Preset[];
  userPresets: PresetListItem[];
  onNew: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onLoad: (id: string, isFactory: boolean) => void;
  onDelete: (id: string) => void;
  onShare: () => void;
  onBrowseAll: () => void;
}

function PresetButton({
  currentPreset,
  isModified,
  factoryPresets,
  userPresets,
  onNew,
  onSave,
  onSaveAs,
  onLoad,
  onDelete,
  onShare,
  onBrowseAll,
}: PresetButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const buttonLabel = currentPreset
    ? `${currentPreset.metadata.name}${isModified ? "*" : ""}`
    : "Presets";

  const recentUserPresets = userPresets.slice(0, 5);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "px-2 py-1 rounded-md border-2 transition-colors",
          "border-pink-500 dark:border-sky-300",
          "hover:bg-pink-100 dark:hover:bg-sky-900",
          "focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-sky-300"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        data-testid="preset-button"
      >
        {buttonLabel} ▾
      </button>

      {isOpen && (
        <div
          className={clsx(
            "absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50",
            "bg-pink-200 dark:bg-gray-800",
            "border-2 border-pink-500 dark:border-sky-300"
          )}
        >
          {/* Actions */}
          <div className="p-2 border-b-2 border-pink-500 dark:border-sky-300">
            <button
              onClick={() => handleAction(onNew)}
              className="w-full text-left px-3 py-2 rounded hover:bg-pink-100 dark:hover:bg-sky-900 transition-colors"
              data-testid="preset-new"
            >
              New Preset
            </button>
            <button
              onClick={() => handleAction(onSave)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded transition-colors",
                currentPreset
                  ? "hover:bg-pink-100 dark:hover:bg-sky-900"
                  : "opacity-40 cursor-not-allowed"
              )}
              disabled={!currentPreset}
              data-testid="preset-save"
            >
              Save
            </button>
            <button
              onClick={() => handleAction(onSaveAs)}
              className="w-full text-left px-3 py-2 rounded hover:bg-pink-100 dark:hover:bg-sky-900 transition-colors"
              data-testid="preset-save-as"
            >
              Save As...
            </button>
            <button
              onClick={() => handleAction(onShare)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded transition-colors",
                currentPreset
                  ? "hover:bg-pink-100 dark:hover:bg-sky-900"
                  : "opacity-40 cursor-not-allowed"
              )}
              disabled={!currentPreset}
              data-testid="preset-share"
            >
              Share Current Preset
            </button>
          </div>

          {/* Factory Presets */}
          <div className="p-2 border-b-2 border-pink-500 dark:border-sky-300">
            <div className="px-3 py-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
              Factory Presets
            </div>
            {factoryPresets.map((preset) => (
              <button
                key={preset.metadata.id}
                onClick={() =>
                  handleAction(() => onLoad(preset.metadata.id, true))
                }
                className={clsx(
                  "w-full text-left px-3 py-2 rounded hover:bg-pink-100 dark:hover:bg-sky-900 transition-colors",
                  "flex items-center justify-between"
                )}
                data-testid={`preset-factory-${preset.metadata.id}`}
              >
                <span>• {preset.metadata.name}</span>
                {currentPreset?.metadata.id === preset.metadata.id && (
                  <span className="text-pink-500 dark:text-sky-300">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* User Presets */}
          <div className="p-2 border-b-2 border-pink-500 dark:border-sky-300">
            <div className="px-3 py-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
              {userPresets.length > 5
                ? `Recent User Presets (${userPresets.length} total)`
                : `My Presets (${userPresets.length})`}
            </div>
            {recentUserPresets.length > 0 ? (
              recentUserPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between hover:bg-pink-100 dark:hover:bg-sky-900 rounded transition-colors"
                >
                  <button
                    onClick={() => handleAction(() => onLoad(preset.id, false))}
                    className="flex-1 text-left px-3 py-2"
                    data-testid={`preset-user-${preset.id}`}
                  >
                    • {preset.name}
                    {currentPreset?.metadata.id === preset.id && (
                      <span className="ml-2 text-pink-500 dark:text-sky-300">
                        ✓
                      </span>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(() => onDelete(preset.id));
                    }}
                    className="px-2 py-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    aria-label={`Delete ${preset.name}`}
                    data-testid={`preset-delete-${preset.id}`}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                No saved presets yet
              </div>
            )}
          </div>

          {/* Browse All */}
          <div className="p-2">
            <button
              onClick={() => handleAction(onBrowseAll)}
              className="w-full text-left px-3 py-2 rounded hover:bg-pink-100 dark:hover:bg-sky-900 transition-colors font-medium"
              data-testid="preset-browse-all"
            >
              Browse All Presets...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresetButton;
