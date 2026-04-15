"use client";

import { LogOut, X } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

type LoginButtonProps = {
  className?: string;
};

export default function LoginButton({ className }: LoginButtonProps) {
  const { data: session, status } = useSession();
  const [showConfirm, setShowConfirm] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setShowConfirm(false), []);

  useEffect(() => {
    if (!showConfirm) return;
    function onClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [showConfirm, close]);

  if (status === "authenticated") {
    const userName = session.user?.name?.trim() || "User";
    const firstName = userName.split(" ")[0];
    const image = session.user?.image;

    return (
      <div className="relative flex items-center gap-1.5">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={firstName}
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {firstName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden text-xs font-medium text-foreground/75 sm:inline sm:text-sm">
          {firstName}
        </span>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-black transition-colors hover:bg-black/10"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="size-3.5" />
        </button>

        {showConfirm && (
          <div
            ref={popoverRef}
            className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-background p-4 shadow-lg"
          >
            <div className="mb-3 flex items-start justify-between">
              <p className="text-sm font-medium text-foreground">Sign out?</p>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-black/10 hover:text-foreground"
                aria-label="Cancel"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <p className="mb-4 text-xs text-foreground/60">
              You&apos;ll need to log in again with Google.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex-1 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black/85"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

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
