"use client";

import { SessionProvider } from "next-auth/react";
import { PrefetchGoogleSignIn } from "@/components/prefetch-google-signin";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider refetchOnWindowFocus refetchInterval={5 * 60}>
      <PrefetchGoogleSignIn />
      {children}
    </SessionProvider>
  );
}
