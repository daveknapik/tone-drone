import { clsx } from "clsx";
import { PropsWithChildren } from "react";

interface ButtonProps {
  handleClick: (e: React.MouseEvent<HTMLElement>) => void;
  isActive?: boolean;
}

function Button({
  handleClick,
  isActive = false,
  children,
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      onClick={handleClick}
      // className="mr-3 border-2 rounded border-pink-500 dark:border-sky-300 px-3 bg-sky-500 hover:bg-pink-500  text-white"
      className={clsx(
        "rounded-md bg-sky-500 px-3 py-2 text-sm text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
        isActive && "bg-violet-500"
      )}
    >
      {children}
    </button>
  );
}

export default Button;
