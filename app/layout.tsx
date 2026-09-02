import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeServe Voice Booking",
  description: "Book a HomeServe AC repair visit with a Sarvam voice agent."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
