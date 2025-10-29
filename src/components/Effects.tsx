import { clsx } from "clsx";
import Heading from "./Heading";
import { useState, Fragment } from "react";

function Effects({ children }: React.PropsWithChildren) {
  const [expandEffects, setExpandEffects] = useState(false);

  const toggleExpandEffects = (): void => {
    setExpandEffects((prev) => !prev);
  };

  // Convert children to array for mapping
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <Fragment>
      <Heading expanded={expandEffects} toggleExpanded={toggleExpandEffects}>
        Effects
      </Heading>
      <div
        className={clsx(
          "grid grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-2 my-5 p-5",
          !expandEffects && "hidden"
        )}
      >
        {childrenArray.map((child, i) => (
          <Fragment key={i}>
            {child}
            {i < childrenArray.length - 1 && (
              <hr className="sm:hidden w-full border-pink-500 dark:border-sky-300" />
            )}
          </Fragment>
        ))}
      </div>
    </Fragment>
  );
}

export default Effects;
