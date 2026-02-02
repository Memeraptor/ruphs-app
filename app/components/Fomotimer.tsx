"use client";

import { useState, useEffect } from "react";

interface FOMOTimerProps {
  isMobile?: boolean;
}

export default function FOMOTimer({ isMobile = false }: FOMOTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize random countdown on mount
  useEffect(() => {
    setIsMounted(true);
    // Generate random hours between 8 and 16
    const randomHours = Math.floor(Math.random() * (16 - 8 + 1)) + 8;
    const randomMinutes = Math.floor(Math.random() * 60);
    const randomSeconds = Math.floor(Math.random() * 60);

    // Convert to total seconds
    const totalSeconds =
      randomHours * 3600 + randomMinutes * 60 + randomSeconds;
    setTimeLeft(totalSeconds);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  if (isMobile) {
    return (
      <li className="mb-2">
        <div className="badge bg-red-700 text-white border-red-700 badge-lg gap-2 px-4 py-4 animate-pulse w-full justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-4 h-4 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-mono text-sm font-bold">
            {formatTime(timeLeft)}
          </span>
        </div>
      </li>
    );
  }

  // Desktop version
  return (
    <div className="badge bg-red-700 text-white border-red-700 badge-lg gap-2 px-4 py-4 animate-pulse">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="inline-block w-4 h-4 stroke-current"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-mono text-sm font-bold">
        FOMO CLOCK: {formatTime(timeLeft)}
      </span>
    </div>
  );
}
