import * as Tone from "tone";
import { clsx } from "clsx";

import Heading from "./Heading";

import { useState, Fragment } from "react";

import PolySynth from "./Polysynth";

interface PolySynthsProps {
  polysynths: Tone.PolySynth[];
}

function PolySynths({ polysynths }: PolySynthsProps) {
  const [expandPolysynths, setExpandPolysynths] = useState(false);

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
          <PolySynth key={i} polySynth={polysynth} />
        ))}
      </div>
    </Fragment>
  );
}

export default PolySynths;
