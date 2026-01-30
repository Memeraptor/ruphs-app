"use client";

import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SignInButton() {
  const pathname = usePathname();

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: pathname || "/" });
  };

  return (
    <button onClick={handleSignIn} className="btn btn-primary btn-md">
      Sign In
    </button>
  );
}
