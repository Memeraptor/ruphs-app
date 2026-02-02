"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import SignInButton from "./components/SignInButton";
import NavigationButtons from "./components/Navigationbuttons";

export default function Navbar() {
  const { status, data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Initialize random countdown on mount
  useEffect(() => {
    // Generate random hours between 10 and 24
    const randomHours = Math.floor(Math.random() * (24 - 10 + 1)) + 10;
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

  return (
    <div className="navbar bg-base-200 shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              ></path>
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {/* Mobile FOMO Clock */}
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

            {/* Mobile Auth Button */}
            <li className="mb-2">
              {status === "unauthenticated" && <SignInButton />}
              {status === "authenticated" && (
                <div className="flex items-center justify-center">
                  <div className="bg-primary flex items-center justify-center p-2 rounded-lg w-full">
                    <span className="text-primary-content font-bold text-sm">
                      {session?.user?.name}
                    </span>
                  </div>
                </div>
              )}
            </li>

            <div className="divider my-1"></div>

            <NavigationButtons isMobile={true} />

            {status === "authenticated" && (
              <>
                <div className="divider my-1"></div>
                <li>
                  <Link
                    href="/api/auth/signout"
                    className="transition-all duration-300 hover:scale-105 hover:bg-error hover:text-error-content"
                  >
                    Logout
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <Link
          href="/"
          className="btn btn-ghost text-xl transition-all duration-300 hover:scale-110"
        >
          Ruphs App
        </Link>
      </div>

      {/* Desktop FOMO Clock - Centered */}
      <div className="navbar-center hidden lg:flex items-center gap-6">
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

        {/* Desktop Navigation */}
        <ul className="menu menu-horizontal px-1">
          <NavigationButtons />
        </ul>
      </div>

      {/* Desktop Auth Section */}
      <div className="navbar-end">
        {status === "unauthenticated" && <SignInButton />}
        {status === "authenticated" && (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost transition-all duration-300 hover:scale-105"
            >
              <div className="rounded-full">
                <div className="bg-primary flex items-center justify-center p-3 rounded-2xl transition-all duration-300 hover:shadow-lg">
                  <span className="text-primary-content font-bold">
                    {session?.user?.name}
                  </span>
                </div>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <Link
                  href="/api/auth/signout"
                  className="transition-all duration-300 hover:scale-105 hover:bg-error hover:text-error-content"
                >
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
