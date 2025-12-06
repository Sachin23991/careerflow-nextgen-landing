import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Show a simple fatal-error overlay so users/developers see the failure instead of a white screen
function showFatalError(message: string) {
  try {
    const existing = document.getElementById("fatal-error-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "fatal-error-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "999999";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.color = "white";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "24px";
    overlay.style.fontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
    overlay.innerHTML = `
      <div style="max-width:900px;text-align:left;">
        <h2 style="margin:0 0 8px 0;font-size:20px;">Application error</h2>
        <pre style="white-space:pre-wrap;color:#ffdede;background:rgba(0,0,0,0.2);padding:12px;border-radius:6px;">${message}</pre>
        <p style="opacity:0.9;margin-top:8px;">Open the browser console for full stack trace.</p>
      </div>
    `;
    document.body.appendChild(overlay);
  } catch (e) {
    // ignore
  }
}

// global handlers so unhandled exceptions show a visible message
window.addEventListener("error", (evt) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled error event:", evt.error || evt.message, evt);
  showFatalError(String(evt.error || evt.message || "Unknown error"));
});

window.addEventListener("unhandledrejection", (evt) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled promise rejection:", evt.reason);
  showFatalError(String(evt.reason || "Unhandled promise rejection"));
});

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
} else {
  // eslint-disable-next-line no-console
  console.error("React root element with id 'root' not found. Ensure index.html contains <div id=\"root\"></div>");
  showFatalError("Missing #root element in index.html");
}
