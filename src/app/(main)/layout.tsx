// (main) is a root layout for the marketing site. It renders <html>/<body>,
// the global font, Tailwind via globals.css, and GA4. The (payload) route
// group has its own RootLayout — keeping the global layout would force
// every Payload admin page into a second nested <html>, leaving the admin
// blank. With this group acting as a root, there must be NO src/app/layout.tsx.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import EmergencyBanner from "@/components/layout/EmergencyBanner";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ChatWidget";
import Analytics from "@/components/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cooperative Bank Tanzania Plc. | Ustawi kwa wote",
  description:
    "Empowering communities through cooperative banking. Savings, loans, digital banking, and more for all Tanzanians.",
  keywords: [
    "CoopBank",
    "Cooperative Bank Tanzania",
    "banking",
    "loans",
    "savings",
    "digital banking",
    "Tanzania",
  ],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <EmergencyBanner />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  );
}
