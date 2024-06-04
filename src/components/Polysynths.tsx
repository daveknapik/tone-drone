import * as Tone from "tone";
import { clsx } from "clsx";

import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";

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
      <div
        className="flex items-center align-items-center mt-5"
        onClick={toggleExpandPolysynths}
      >
        {expandPolysynths ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
        PolySynth
      </div>
      <div
        className={clsx(
          "grid grid-cols-1 md:grid-cols-2 gap-12 my-5 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5",
          !expandPolysynths && "hidden"
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
