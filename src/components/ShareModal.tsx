import { useState, useEffect } from "react";
import { clsx } from "clsx";
import type { Preset } from "../types/Preset";
import { createShareableUrl } from "../utils/presetUrl";
import { serializePreset } from "../utils/presetSerializer";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: Preset | null;
}

function ShareModal({ isOpen, onClose, preset }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen && preset) {
      const url = createShareableUrl(preset);
      setShareUrl(url);
    }
  }, [isOpen, preset]);

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

  // Reset copy success when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopySuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !preset) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      alert("Failed to copy URL to clipboard");
    }
  };

  const handleDownloadJson = () => {
    const json = serializePreset(preset);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Create filename from preset name
    const filename = `${preset.metadata.name
      .toLowerCase()
      .replace(/\s+/g, "-")}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={clsx(
          "bg-pink-200 dark:bg-gray-800 rounded-lg shadow-2xl",
          "border-2 border-pink-500 dark:border-sky-300",
          "max-w-2xl w-full max-h-[90vh] flex flex-col"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-pink-500 dark:border-sky-300">
          <h2 className="text-2xl font-bold">
            Share: &quot;{preset.metadata.name}&quot;
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:text-pink-500 dark:hover:text-sky-300 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Shareable URL Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              🔗 Shareable URL
            </h3>
            <div className="space-y-3">
              <div
                className={clsx(
                  "p-3 rounded border-2 font-mono text-sm break-all",
                  "border-pink-300 dark:border-sky-700",
                  "bg-pink-50 dark:bg-gray-700"
                )}
              >
                {shareUrl}
              </div>
              <button
                onClick={() => {
                  void handleCopyUrl();
                }}
                className={clsx(
                  "w-full px-4 py-3 rounded border-2 font-medium",
                  "border-pink-500 dark:border-sky-300",
                  copySuccess
                    ? "bg-green-100 dark:bg-green-900 border-green-500"
                    : "hover:bg-pink-100 dark:hover:bg-sky-900",
                  "transition-colors"
                )}
                data-testid="share-copy-url"
              >
                {copySuccess
                  ? "✓ Copied to Clipboard!"
                  : "Copy URL to Clipboard"}
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Anyone with this link can load this preset instantly by visiting
                the URL or pasting it into the Import section.
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-pink-500 dark:border-sky-300" />

          {/* Export JSON Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Export as JSON File
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadJson}
                className={clsx(
                  "w-full px-4 py-3 rounded border-2 font-medium",
                  "border-pink-500 dark:border-sky-300",
                  "hover:bg-pink-100 dark:hover:bg-sky-900",
                  "transition-colors"
                )}
                data-testid="share-download-json"
              >
                Download &quot;{preset.metadata.name}.json&quot;
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For backup or sharing with advanced users. The JSON file can be
                imported via the &quot;Import from File&quot; button in the
                Preset Manager.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
