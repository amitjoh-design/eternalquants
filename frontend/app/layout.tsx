import type { Metadata } from "next";
import { Inter, Orbitron, Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const rajdhani = Rajdhani({ weight: ["300", "400", "500", "600", "700"], subsets: ["latin"], variable: "--font-rajdhani" });
const shareTechMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-share-tech-mono" });

export const metadata: Metadata = {
  title: "EternalQuants",
  description: "Where Quants Meet. Models Compete.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable} min-h-screen bg-background font-sans antialiased text-foreground`}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
