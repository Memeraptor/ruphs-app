"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="navbar bg-base-100 shadow-lg">
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
            <li>
              <Link
                href="/classes"
                className={isActive("/classes") ? "active" : ""}
              >
                Classes
              </Link>
            </li>
            <li>
              <Link
                href="/races"
                className={isActive("/races") ? "active" : ""}
              >
                Races
              </Link>
            </li>
            <li>
              <Link
                href="/race-classes"
                className={isActive("/race-classes") ? "active" : ""}
              >
                Race Classes
              </Link>
            </li>
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl">
          MyApp
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link
              href="/classes"
              className={`btn btn-ghost ${
                isActive("/classes") ? "btn-active" : ""
              }`}
            >
              Classes
            </Link>
          </li>
          <li>
            <Link
              href="/races"
              className={`btn btn-ghost ${
                isActive("/races") ? "btn-active" : ""
              }`}
            >
              Races
            </Link>
          </li>
          <li>
            <Link
              href="/race-classes"
              className={`btn btn-ghost ${
                isActive("/race-classes") ? "btn-active" : ""
              }`}
            >
              Race Classes
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-content font-bold">U</span>
              </div>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <li>
              <a>Profile</a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
