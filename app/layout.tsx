import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { ViewTransitions } from 'next-view-transitions';
import localFont from "next/font/local";
import "./globals.css";
import StoreProvider from "./store-provider";

const publicSans = localFont({
  src: "./fonts/PublicSans-VariableFont_wght.ttf",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Argenetics - Panel de administración",
  description: "Panel de administración de Argenetics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <StoreProvider>
        <html lang="en">
          <body
            className={`${publicSans.variable} antialiased`}
          >
            {children}
            <Toaster />
          </body>
        </html>
      </StoreProvider>
    </ViewTransitions>
  );
}
