"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import SignInButton from "./components/SignInButton";
import FOMOTimer from "./components/Fomotimer";
import NavigationButtons from "./components/Navigationbuttons";

export default function Navbar() {
  const { status, data: session } = useSession();

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
            <FOMOTimer isMobile={true} />

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
        <FOMOTimer />

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
