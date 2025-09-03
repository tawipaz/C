import React, { useEffect, useState } from "react";

export default function OnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <span
      className={`flex items-center px-3 py-1 rounded-xl font-semibold text-xs shadow-md ${
        online
          ? "bg-blue-100 text-blue-700 border border-blue-300"
          : "bg-yellow-100 text-yellow-700 border border-yellow-300"
      }`}
      title={online ? "ออนไลน์" : "ออฟไลน์"}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full mr-2 shadow ${
          online ? "bg-blue-500" : "bg-yellow-500"
        }`}
      />
      {online ? "ออนไลน์" : "ออฟไลน์"}
    </span>
  );
}
