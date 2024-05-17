import { useEffect, useState } from "react";

export function useDarkMode(): [boolean, () => void] {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkModeSetting = localStorage.getItem("dark");

    // use the localStorage value if it exists, otherwise use false
    const initialValue: boolean = savedDarkModeSetting
      ? (JSON.parse(savedDarkModeSetting) as boolean)
      : false;

    return initialValue;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark", "false");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return [isDarkMode, toggleDarkMode];
}
