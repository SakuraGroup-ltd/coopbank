import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
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
