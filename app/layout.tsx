import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap"
});

export const metadata: Metadata = {
  title: "E-Perpus Amerta",
  description: "Website e-perpus berbasis Next.js, Supabase, dan Vercel."
};

import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${jakarta.variable} font-body antialiased`}>
        <NextTopLoader color="#0ea5e9" showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
