"use client";

import { signIn } from "next-auth/react";

type LoginButtonProps = {
  className?: string;
};

export default function LoginButton({ className }: LoginButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className={className}
    >
      Login
    </button>
  );
}
