import { clsx } from "clsx";

import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";

import { useState, Fragment } from "react";

function Effects({ children }: React.PropsWithChildren) {
  const [expandEffects, setExpandEffects] = useState(false);

  const toggleExpandEffects = (): void => {
    setExpandEffects((prev) => !prev);
  };

  return (
    <Fragment>
      <div
        className="flex items-center align-items-center mt-5"
        onClick={toggleExpandEffects}
      >
        {expandEffects ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
        Effects
      </div>
      <div
        className={clsx(
          "grid grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-2 my-5 border-2 rounded border-pink-500 dark:border-sky-300 p-5",
          !expandEffects && "hidden"
        )}
      >
        {children}
      </div>
    </Fragment>
  );
}

export default Effects;
