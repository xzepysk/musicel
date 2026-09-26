"use client";
import { SessionProvider } from "next-auth/react";
import AudioProvider from "./AudioProvider";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AudioProvider>{children}</AudioProvider>
    </SessionProvider>
  );
}