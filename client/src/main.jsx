import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.92)",
            color: "#0f172a",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            backdropFilter: "blur(10px)",
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
