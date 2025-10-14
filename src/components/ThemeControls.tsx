import { useDarkMode } from "../hooks/useDarkMode";

function ThemeControls() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <button
      className="border-2 rounded-md border-pink-500 dark:border-sky-300 px-2 py-1"
      onClick={toggleDarkMode}
      data-testid="theme-toggle"
    >
      Theme: {isDarkMode ? "Dark" : "Light"}
    </button>
  );
}

export default ThemeControls;
