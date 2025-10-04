import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReceiptExtract - AI-Powered Receipt Data Extraction",
  description: "Transform your payment receipts into structured data with AI-powered extraction. Fast, accurate, and completely private.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-900 text-gray-100 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
