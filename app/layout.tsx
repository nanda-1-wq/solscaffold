import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SolanaProviders from "@/lib/solana/wallet-provider";
import { TopNav } from "@/components/shared/TopNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SolScaffold",
  description: "Full-stack Solana developer toolkit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        <SolanaProviders>
          <TopNav />
          {children}
        </SolanaProviders>
      </body>
    </html>
  );
}
