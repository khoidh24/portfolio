import type { Metadata } from "next";
import { Be_Vietnam_Pro, Domine } from "next/font/google";

import CustomCursor from "@/components/CustomCursor";

import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const domine = Domine({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-domine",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Volunote",
  description: "Zen Software Engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
        />
      </head>
      <body
        className={`${beVietnamPro.variable} ${domine.variable} antialiased`}
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
