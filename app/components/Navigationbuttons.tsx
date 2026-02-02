"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationButtonsProps {
  isMobile?: boolean;
}

export default function NavigationButtons({
  isMobile = false,
}: NavigationButtonsProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { href: "/classes", label: "Classes" },
    { href: "/races", label: "Races" },
    { href: "/race-classes", label: "Race Classes" },
    { href: "/specializations", label: "Specializations" },
  ];

  if (isMobile) {
    return (
      <>
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-content ${
                isActive(link.href)
                  ? "bg-primary text-primary-content scale-105"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </>
    );
  }

  // Desktop version
  return (
    <>
      {navLinks.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`btn btn-ghost mx-1.5 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-content ${
              isActive(link.href)
                ? "bg-primary text-primary-content scale-105"
                : ""
            }`}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </>
  );
}
