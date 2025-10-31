import React from "react";
import "./Notification.css";

function Notification({ message, show }) {
  return show ? (
    <div className={`notification show`}>
      {message}
    </div>
  ) : null;
}

// Re-export the TypeScript Notification component (keeps existing imports working)
export { default } from "./Notification";
