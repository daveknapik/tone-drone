import { useState, useEffect } from "react";
import { clsx } from "clsx";
import type { Preset, PresetListItem } from "../types/Preset";

interface PresetBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: Preset | null;
  factoryPresets: Preset[];
  userPresets: PresetListItem[];
  onLoad: (id: string, isFactory: boolean) => void;
  onDelete: (id: string) => void;
  onImport: (file: File) => void;
  onImportUrl: (url: string) => void;
}

function PresetBrowserModal({
  isOpen,
  onClose,
  currentPreset,
  factoryPresets,
  userPresets,
  onLoad,
  onDelete,
  onImport,
  onImportUrl,
}: PresetBrowserModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [importText, setImportText] = useState("");

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredUserPresets = userPresets.filter((preset) =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFactoryPresets = factoryPresets.filter((preset) => {
    const nameMatch = preset.metadata.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const descMatch = preset.metadata.description
      ? preset.metadata.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : false;
    return nameMatch || descMatch;
  });

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const handleImportUrl = () => {
    if (importText.trim()) {
      onImportUrl(importText.trim());
      setImportText("");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={clsx(
          "bg-white dark:bg-gray-800 rounded-lg shadow-2xl",
          "border-2 border-pink-500 dark:border-sky-300",
          "max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-pink-500 dark:border-sky-300">
          <h2 className="text-2xl font-bold">Preset Manager</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:text-pink-500 dark:hover:text-sky-300 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b-2 border-pink-500 dark:border-sky-300">
          <input
            type="text"
            placeholder="🔍 Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={clsx(
              "w-full px-4 py-2 rounded border-2",
              "border-pink-500 dark:border-sky-300",
              "bg-white dark:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-sky-300"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Factory Presets */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Factory Presets ({filteredFactoryPresets.length})
            </h3>
            <div className="space-y-2">
              {filteredFactoryPresets.map((preset) => (
                <div
                  key={preset.metadata.id}
                  className={clsx(
                    "p-4 rounded border-2 transition-colors",
                    "border-pink-300 dark:border-sky-700",
                    "hover:border-pink-500 dark:hover:border-sky-300",
                    "bg-pink-50 dark:bg-gray-700"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {preset.metadata.name}
                        </h4>
                        {currentPreset?.metadata.id === preset.metadata.id && (
                          <span className="text-pink-500 dark:text-sky-300">
                            ✓ Current
                          </span>
                        )}
                      </div>
                      {preset.metadata.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {preset.metadata.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onLoad(preset.metadata.id, true)}
                      className={clsx(
                        "px-4 py-2 rounded border-2",
                        "border-pink-500 dark:border-sky-300",
                        "bg-white dark:bg-gray-800",
                        "hover:bg-pink-100 dark:hover:bg-sky-900",
                        "transition-colors font-medium"
                      )}
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Presets */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              My Presets ({filteredUserPresets.length})
            </h3>
            {filteredUserPresets.length > 0 ? (
              <div className="space-y-2">
                {filteredUserPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className={clsx(
                      "p-4 rounded border-2 transition-colors",
                      "border-pink-300 dark:border-sky-700",
                      "hover:border-pink-500 dark:hover:border-sky-300"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{preset.name}</h4>
                          {currentPreset?.metadata.id === preset.id && (
                            <span className="text-pink-500 dark:text-sky-300">
                              ✓ Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Created: {formatDate(preset.created)}
                          {preset.modified &&
                            ` • Modified: ${formatDate(preset.modified)}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onDelete(preset.id)}
                          className={clsx(
                            "px-3 py-2 rounded",
                            "text-red-500 hover:text-red-700 dark:hover:text-red-400",
                            "hover:bg-red-50 dark:hover:bg-red-900/20",
                            "transition-colors"
                          )}
                          aria-label={`Delete ${preset.name}`}
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => onLoad(preset.id, false)}
                          className={clsx(
                            "px-4 py-2 rounded border-2",
                            "border-pink-500 dark:border-sky-300",
                            "bg-white dark:bg-gray-800",
                            "hover:bg-pink-100 dark:hover:bg-sky-900",
                            "transition-colors font-medium"
                          )}
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No user presets saved yet. Use &quot;Save As...&quot; to create
                one!
              </p>
            )}
          </div>

          {/* Import Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Import Preset
            </h3>
            <div className="space-y-3">
              <textarea
                placeholder="Paste preset URL or JSON here..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className={clsx(
                  "w-full px-4 py-2 rounded border-2 h-24 resize-none",
                  "border-pink-500 dark:border-sky-300",
                  "bg-white dark:bg-gray-700",
                  "focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-sky-300"
                )}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleImportUrl}
                  disabled={!importText.trim()}
                  className={clsx(
                    "px-4 py-2 rounded border-2",
                    "border-pink-500 dark:border-sky-300",
                    "hover:bg-pink-100 dark:hover:bg-sky-900",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-colors"
                  )}
                >
                  Import from Text
                </button>
                <label
                  className={clsx(
                    "px-4 py-2 rounded border-2 cursor-pointer",
                    "border-pink-500 dark:border-sky-300",
                    "hover:bg-pink-100 dark:hover:bg-sky-900",
                    "transition-colors"
                  )}
                >
                  Import from File...
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PresetBrowserModal;
