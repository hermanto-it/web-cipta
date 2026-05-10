import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PT Cipta Solusi Techindo | Enterprise IT Solutions",
    template: "%s | PT Cipta Solusi Techindo",
  },
  description:
    "Enterprise IT Products & Infrastructure Solutions untuk PC Desktop, Laptop, Workstation, Server, Storage, Networking, dan Accessories.",
  keywords: [
    "PT Cipta Solusi Techindo",
    "enterprise IT",
    "server",
    "storage",
    "workstation",
    "networking",
    "laptop bisnis",
    "infrastruktur IT",
  ],
  authors: [{ name: "PT Cipta Solusi Techindo" }],
  creator: "PT Cipta Solusi Techindo",
  publisher: "PT Cipta Solusi Techindo",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "PT Cipta Solusi Techindo",
    title: "PT Cipta Solusi Techindo | Enterprise IT Solutions",
    description:
      "Enterprise IT Products & Infrastructure Solutions untuk PC Desktop, Laptop, Workstation, Server, Storage, Networking, dan Accessories.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PT Cipta Solusi Techindo | Enterprise IT Solutions",
    description:
      "Enterprise IT Products & Infrastructure Solutions untuk PC Desktop, Laptop, Workstation, Server, Storage, Networking, dan Accessories.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
