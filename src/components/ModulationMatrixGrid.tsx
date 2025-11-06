import { useState, useCallback, useEffect } from "react";
import { clsx } from "clsx";
import { useDebounceCallback } from "usehooks-ts";
import {
  ModulationRoute,
  ModulationDestination,
  DestinationInfo,
} from "../types/ModulationMatrixParams";
import Slider from "./Slider";

interface ModulationMatrixGridProps {
  routes: ModulationRoute[];
  onRoutesChange: (routes: ModulationRoute[]) => void;
  onParameterChange?: () => void;
  onDepthChange?: (routeIndex: number, amount: number) => void; // Direct Tone.js update, bypasses React
}

// Define available destinations with categories
const DESTINATIONS: DestinationInfo[] = [
  { value: "none", label: "None", category: "None" },
  // Oscillator Volume
  { value: "osc1-volume", label: "Osc 1 Volume", category: "Volume" },
  { value: "osc2-volume", label: "Osc 2 Volume", category: "Volume" },
  { value: "osc3-volume", label: "Osc 3 Volume", category: "Volume" },
  { value: "osc4-volume", label: "Osc 4 Volume", category: "Volume" },
  { value: "osc5-volume", label: "Osc 5 Volume", category: "Volume" },
  { value: "osc6-volume", label: "Osc 6 Volume", category: "Volume" },
  // Oscillator Frequency
  { value: "osc1-frequency", label: "Osc 1 Frequency", category: "Frequency" },
  { value: "osc2-frequency", label: "Osc 2 Frequency", category: "Frequency" },
  { value: "osc3-frequency", label: "Osc 3 Frequency", category: "Frequency" },
  { value: "osc4-frequency", label: "Osc 4 Frequency", category: "Frequency" },
  { value: "osc5-frequency", label: "Osc 5 Frequency", category: "Frequency" },
  { value: "osc6-frequency", label: "Osc 6 Frequency", category: "Frequency" },
  // Oscillator Pan
  { value: "osc1-pan", label: "Osc 1 Pan", category: "Pan" },
  { value: "osc2-pan", label: "Osc 2 Pan", category: "Pan" },
  { value: "osc3-pan", label: "Osc 3 Pan", category: "Pan" },
  { value: "osc4-pan", label: "Osc 4 Pan", category: "Pan" },
  { value: "osc5-pan", label: "Osc 5 Pan", category: "Pan" },
  { value: "osc6-pan", label: "Osc 6 Pan", category: "Pan" },
  // Effects
  { value: "filter-frequency", label: "Filter Frequency", category: "Effects" },
  { value: "filter-q", label: "Filter Q", category: "Effects" },
  { value: "delay-time", label: "Delay Time", category: "Effects" },
  { value: "delay-feedback", label: "Delay Feedback", category: "Effects" },
  // Microlooper (FeedbackDelay under the hood)
  { value: "micro-time", label: "Microlooper Time", category: "Effects" },
  { value: "micro-feedback", label: "Microlooper Feedback", category: "Effects" },
  // BitCrusher
  { value: "bitcrusher-bits", label: "BitCrusher Bits", category: "Effects" },
  // Chebyshev
  { value: "chebyshev-order", label: "Chebyshev Order", category: "Effects" },
];

function ModulationMatrixGrid({
  routes,
  onRoutesChange,
  onParameterChange,
  onDepthChange,
}: ModulationMatrixGridProps) {
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);
  // Local state for slider values (immediate visual feedback)
  const [localAmounts, setLocalAmounts] = useState<number[]>(
    routes.map((r) => r.amount)
  );

  const updateRoute = useCallback(
    (index: number, updates: Partial<ModulationRoute>): void => {
      const newRoutes = [...routes];
      newRoutes[index] = { ...newRoutes[index], ...updates };
      onRoutesChange(newRoutes);
      onParameterChange?.();
    },
    [routes, onRoutesChange, onParameterChange]
  );

  // Longer debounce for state persistence (only for serialization, not audio)
  const updateRouteStatePersistence = useDebounceCallback(updateRoute, 500);

  // Sync local amounts when routes change from outside (e.g., preset load)
  useEffect(() => {
    setLocalAmounts(routes.map((r) => r.amount));
  }, [routes.length]); // Only sync when routes are added/removed

  const addRoute = (): void => {
    if (routes.length < 8) {
      // Limit to 8 routes
      const newRoute: ModulationRoute = {
        sourceIndex: 0,
        destination: "none",
        amount: 0.5,
      };
      onRoutesChange([...routes, newRoute]);
      setLocalAmounts([...localAmounts, 0.5]);
      setExpandedRoute(routes.length); // Auto-expand new route
      onParameterChange?.();
    }
  };

  const removeRoute = (index: number): void => {
    const newRoutes = routes.filter((_, i) => i !== index);
    onRoutesChange(newRoutes);
    setLocalAmounts(localAmounts.filter((_, i) => i !== index));
    if (expandedRoute === index) {
      setExpandedRoute(null);
    }
    onParameterChange?.();
  };

  const getRouteLabel = (route: ModulationRoute): string => {
    const destInfo = DESTINATIONS.find((d) => d.value === route.destination);
    const destLabel = destInfo?.label || "None";
    return `LFO ${route.sourceIndex + 1} → ${destLabel}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-pink-500 dark:text-sky-300">
          Modulation Routes
        </h3>
        <button
          onClick={addRoute}
          disabled={routes.length >= 8}
          className={clsx(
            "px-3 py-1 rounded border-2 text-sm",
            "border-pink-500 dark:border-sky-300",
            routes.length >= 8
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-pink-100 dark:hover:bg-sky-900"
          )}
        >
          + Add Route
        </button>
      </div>

      {routes.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No modulation routes. Click &quot;Add Route&quot; to create one.
        </div>
      )}

      <div className="space-y-2">
        {routes.map((route, index) => (
          <div
            key={index}
            className="border-2 rounded border-pink-500 dark:border-sky-300 overflow-hidden"
          >
            {/* Route Header */}
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-pink-100 dark:hover:bg-sky-900"
              onClick={() =>
                setExpandedRoute(expandedRoute === index ? null : index)
              }
            >
              <span className="font-medium">{getRouteLabel(route)}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {((localAmounts[index] ?? route.amount) * 100).toFixed(0)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRoute(index);
                  }}
                  className="text-pink-500 dark:text-sky-300 hover:text-pink-700 dark:hover:text-sky-500 font-bold"
                  aria-label="Remove route"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Route Details (Expanded) */}
            {expandedRoute === index && (
              <div className="p-4 border-t-2 border-pink-500 dark:border-sky-300 bg-pink-50 dark:bg-gray-900 space-y-4">
                {/* Source Selection */}
                <div>
                  <label className="block text-sm mb-1">Source LFO</label>
                  <select
                    value={route.sourceIndex}
                    onChange={(e) =>
                      updateRoute(index, {
                        sourceIndex: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1 border-2 rounded border-pink-500 dark:border-sky-300 bg-white dark:bg-gray-800"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <option key={i} value={i}>
                        LFO {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Selection */}
                <div>
                  <label className="block text-sm mb-1">Destination</label>
                  <select
                    value={route.destination}
                    onChange={(e) =>
                      updateRoute(index, {
                        destination: e.target.value as ModulationDestination,
                      })
                    }
                    className="w-full px-2 py-1 border-2 rounded border-pink-500 dark:border-sky-300 bg-white dark:bg-gray-800"
                  >
                    {DESTINATIONS.map((dest) => (
                      <option key={dest.value} value={dest.value}>
                        {dest.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Slider */}
                <div>
                  <Slider
                    inputName={`route${index}-amount`}
                    min={0}
                    max={1}
                    value={localAmounts[index] ?? route.amount}
                    labelText="Depth"
                    step={0.01}
                    handleChange={(e) => {
                      const newAmount = parseFloat(e.target.value);

                      // 1. Update local state immediately for responsive UI
                      const newLocalAmounts = [...localAmounts];
                      newLocalAmounts[index] = newAmount;
                      setLocalAmounts(newLocalAmounts);

                      // 2. Update Tone.js immediately (imperative, no React state)
                      onDepthChange?.(index, newAmount);

                      // 3. Update React state ONLY after 500ms of inactivity (persistence/serialization)
                      //    During active dragging, state does NOT update - no React overhead!
                      updateRouteStatePersistence(index, { amount: newAmount });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModulationMatrixGrid;
