import React from "react";
import "./Notification.css";

interface NotificationProps {
  message?: string;
  show: boolean;
}

const Notification: React.FC<NotificationProps> = ({ message = "", show }) => {
  if (!show) return null;
  return <div className="notification show">{message}</div>;
};

export default Notification;
