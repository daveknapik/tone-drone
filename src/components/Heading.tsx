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
    <div
      className="flex items-center align-items-center my-5"
      onClick={toggleExpanded}
    >
      {expanded ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
      {children}
    </div>
  );
}

export default Heading;
