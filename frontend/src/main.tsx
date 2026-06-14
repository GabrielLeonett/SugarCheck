import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./stores/i18n";
import App from "./App";

// Capturamos el elemento raíz
const rootElement = document.getElementById("root");

// Verificamos que el elemento exista para evitar errores de tipo "null" en TS
if (!rootElement) {
  throw new Error(
    "No se pudo encontrar el elemento root. Asegúrate de que esté en tu index.html",
  );
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
