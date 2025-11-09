import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";

interface HeadingProps {
  expanded: boolean;
  toggleExpanded: () => void;
}

function Heading({
  children,
  expanded,
  toggleExpanded,
}: React.PropsWithChildren<HeadingProps>) {
  return (
    <button
      className="flex items-center align-items-center my-5 bg-transparent border-none cursor-pointer text-inherit font-inherit p-0"
      onClick={toggleExpanded}
      aria-expanded={expanded}
      type="button"
    >
      {expanded ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
      {children}
    </button>
  );
}

export default Heading;
