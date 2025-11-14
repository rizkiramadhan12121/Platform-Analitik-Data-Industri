import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Kemenperin Industri",
  description: "Analitik data industri dan prediksi lahan kosong",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> 
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-cyan-500 text-white">DI</span>
              <span className="hidden sm:block">Data Industri & Spasial</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:underline">Beranda</Link>
              <Link href="/data" className="hover:underline">Katalog Data</Link>
              <Link href="/prediksi" className="hover:underline">Prediksi Lahan</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6">{children}</main>
        <footer className="border-t border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50 py-10 text-sm text-zinc-600 dark:border-zinc-800 dark:from-zinc-900 dark:to-black">
          <div className="mx-auto max-w-7xl px-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-semibold tracking-tight">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-cyan-500 text-white">DI</span>
                <span>Data Industri & Spasial</span>
              </div>
              <p className="mt-3 text-xs">Analitik data industri, infrastruktur, dan spasial untuk mendukung pengambilan keputusan kawasan.</p>
              <div className="mt-4 flex items-center gap-3">
                <a href="https://github.com/rizkiramadhan12121" aria-label="GitHub" className="rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Github className="h-4 w-4" /></a>
                <a href="#" aria-label="Twitter" className="rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Twitter className="h-4 w-4" /></a>
                <a href="#" aria-label="Email" className="rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Mail className="h-4 w-4" /></a>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Navigasi</div>
              <ul className="mt-3 space-y-2">
                <li><Link href="/">Beranda</Link></li>
                <li><Link href="/data">Katalog Data</Link></li>
                <li><Link href="/prediksi">Prediksi Lahan</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Data</div>
              <ul className="mt-3 space-y-2">
                <li><Link href="/data/industry_sites.json">Lokasi Industri</Link></li>
                <li><Link href="/data/roads.json">Jaringan Jalan</Link></li>
                <li><Link href="/data/ports_airports.json">Pelabuhan & Bandara</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Tentang</div>
              <ul className="mt-3 space-y-2">
                <li><a href="#">Dokumentasi</a></li>
                <li><a href="#">Privasi</a></li>
                <li><a href="#">Kontak</a></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-7xl px-6 flex items-center justify-between text-xs">
            <span>© {new Date().getFullYear()} Data Industri</span>
            <span>Dibangun dengan Next.js dan Tailwind</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
