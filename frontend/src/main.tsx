import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

/**
 * Main application component that wraps the application with theme provider and layout.
 * @returns {JSX.Element} The rendered application component.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
