import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Site",
  description: "Built with InfernoByte Site Builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
