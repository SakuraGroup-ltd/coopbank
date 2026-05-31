// Studio root layout — third parallel root alongside (main) and (payload).
// Renders its own html/body so we get a clean editorial surface with no
// site navbar/chat-widget bleeding in.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoopBank Studio",
  description: "Content studio for Cooperative Bank Tanzania.",
  icons: { icon: "/apple-icon.png" },
};

export default function StudioRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
