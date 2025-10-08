import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AudioProvider } from "../context/audio";

// Custom render function that includes providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) => <AudioProvider>{children}</AudioProvider>,
    ...options,
  });
}

// Re-export everything from testing library
// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
export { customRender as render };
