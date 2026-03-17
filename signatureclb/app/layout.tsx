import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Kita pakai font Inter yang pasti ada
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Collab Sign",
  description: "Aplikasi tanda tangan bersama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}