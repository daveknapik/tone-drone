// Based on https://blog.logrocket.com/using-localstorage-react-hooks/
// localStorage-backed useState wrapper

import { useState, useEffect } from "react";

function getStorageValue(key: string, defaultValue: string) {
  // getting stored value
  const saved = localStorage.getItem(key) ?? "";
  const initialValue: string = JSON.parse(saved) as string;
  return initialValue || defaultValue;
}

export const useLocalStorage = (key: string, defaultValue: string) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
