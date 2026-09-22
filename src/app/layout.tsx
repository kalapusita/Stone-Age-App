import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life in the Stone Age",
  description:
    "An interactive archaeological investigation for Grade 10 Ancient History: what can archaeological evidence tell us about the lives of prehistoric humans?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-char-950 text-parchment font-serif antialiased">
        {children}
      </body>
    </html>
  );
}
