import { clsx } from "clsx";

import Heading from "./Heading";

import { useState, Fragment, useRef, useImperativeHandle } from "react";

import PolySynth from "./Polysynth";
import {
  DEFAULT_POLYSYNTH_PARAMS,
  DEFAULT_POLYSYNTHS_STATE,
} from "../utils/presetDefaults";
import { PolySynthHandle, PolySynthsState } from "../types/PolySynthParams";
import { PolySynthWithPanner } from "../types/PolySynthWithPanner";

export interface PolySynthsHandle {
  getState: () => PolySynthsState;
  setState: (state: PolySynthsState) => void;
}

interface PolySynthsProps {
  polysynths: PolySynthWithPanner[];
  ref?: React.Ref<PolySynthsHandle>;
  onParameterChange?: () => void;
}

function PolySynths({ polysynths, ref, onParameterChange }: PolySynthsProps) {
  const [expandPolysynths, setExpandPolysynths] = useState(false);

  // Keyboard shortcuts for each polysynth
  // Polysynth 1 (left/top): 'o', Polysynth 2 (right/bottom): 'p'
  const keyboardShortcuts = [["o"], ["p"]];

  // Create refs for each polysynth component
  const polysynthRefs = useRef<(PolySynthHandle | null)[]>([]);

  // Expose state to parent via ref
  useImperativeHandle(ref, () => ({
    getState: (): PolySynthsState => {
      // Get params from each polysynth child component
      const polysynthParams = polysynthRefs.current.map(
        (psRef) => psRef?.getParams() ?? DEFAULT_POLYSYNTH_PARAMS
      );

      return {
        polysynths: polysynthParams,
      };
    },
    setState: (state: PolySynthsState) => {
      // Set params on each polysynth child component
      state.polysynths.forEach((psParams, index) => {
        polysynthRefs.current[index]?.setParams(psParams);
      });
    },
  }));

  const toggleExpandPolysynths = (): void => {
    setExpandPolysynths((prev) => !prev);
  };

  return (
    <Fragment>
      <Heading
        expanded={expandPolysynths}
        toggleExpanded={toggleExpandPolysynths}
      >
        PolySynths
      </Heading>
      <div
        className={clsx(
          "grid grid-cols-1 gap-12 my-5 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5",
          !expandPolysynths && "hidden",
          polysynths.length > 1 && "md:grid-cols-2"
        )}
      >
        {polysynths.map(({ polysynth, panner }, i) => (
          <PolySynth
            key={i}
            polySynth={polysynth}
            panner={panner}
            keyboardShortcuts={keyboardShortcuts[i] ?? ["p"]}
            initialParams={DEFAULT_POLYSYNTHS_STATE.polysynths[i]}
            ref={(el) => {
              polysynthRefs.current[i] = el;
            }}
            onParameterChange={onParameterChange}
          />
        ))}
      </div>
    </Fragment>
  );
}

export default PolySynths;
