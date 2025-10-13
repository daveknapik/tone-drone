import * as Tone from "tone";
import { clsx } from "clsx";

import Heading from "./Heading";

import { useState, Fragment, useRef, useImperativeHandle } from "react";

import PolySynth from "./Polysynth";
import { DEFAULT_POLYSYNTH_PARAMS } from "../utils/presetDefaults";
import {
  PolySynthHandle,
  PolySynthsState,
} from "../types/PolySynthParams";

export interface PolySynthsHandle {
  getState: () => PolySynthsState;
  setState: (state: PolySynthsState) => void;
}

interface PolySynthsProps {
  polysynths: Tone.PolySynth[];
  ref?: React.Ref<PolySynthsHandle>;
}

function PolySynths({ polysynths, ref }: PolySynthsProps) {
  const [expandPolysynths, setExpandPolysynths] = useState(false);

  // Create refs for each polysynth component
  const polysynthRefs = useRef<(PolySynthHandle | null)[]>([]);

  // Expose state to parent via ref
  useImperativeHandle(ref, () => ({
    getState: (): PolySynthsState => {
      // Get params from each polysynth child component
      const polysynthParams = polysynthRefs.current.map((psRef) =>
        psRef?.getParams() ?? DEFAULT_POLYSYNTH_PARAMS
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
        PolySynth
      </Heading>
      <div
        className={clsx(
          "grid grid-cols-1 gap-12 my-5 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5",
          !expandPolysynths && "hidden",
          polysynths.length > 1 && "md:grid-cols-2"
        )}
      >
        {polysynths.map((polysynth, i) => (
          <PolySynth
            key={i}
            polySynth={polysynth}
            ref={(el) => {
              polysynthRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </Fragment>
  );
}

export default PolySynths;
