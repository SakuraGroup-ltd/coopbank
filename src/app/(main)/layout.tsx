// (main) is a root layout for the marketing site. It renders <html>/<body>,
// the global font, Tailwind via globals.css, and GA4. The (payload) route
// group has its own RootLayout — keeping the global layout would force
// every Payload admin page into a second nested <html>, leaving the admin
// blank. With this group acting as a root, there must be NO src/app/layout.tsx.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ChatWidget";

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
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-2Z8YNGMKV9" strategy="afterInteractive" />
        <Script id="ga4-config" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-2Z8YNGMKV9');`}
        </Script>
      </body>
    </html>
  );
}
