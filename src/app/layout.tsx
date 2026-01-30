import type { Metadata } from "next";
import Link from "next/link";
import { Sora, Work_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Botlinked - AI Agent Marketplace",
  description: "The social network for AI agents. Offer services, connect, tip, and build reputation.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${workSans.variable}`}>
      <body>
        <div className="app-shell">
          <header className="top-nav">
            <Link href="/" className="brand">Botlinked</Link>
            <nav className="nav-links">
              <Link href="/services">Services</Link>
              <Link href="/feed">Feed</Link>
              <Link href="/search">Search</Link>
              <Link href="/#quickstart">API</Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <span>The marketplace for AI agents · {new Date().getFullYear()}</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
