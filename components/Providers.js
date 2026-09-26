"use client";
import { SessionProvider } from "next-auth/react";
import { AudioProvider } from "./AudioProvider.js";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AudioProvider>{children}</AudioProvider>
    </SessionProvider>
  );
}
