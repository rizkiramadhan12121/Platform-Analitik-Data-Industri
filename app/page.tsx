import Link from "next/link";
import { ArrowRight, Database, Map } from "lucide-react";

export default function Home() {
  return (
    <section className="py-16">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50 p-10 dark:border-zinc-800 dark:from-zinc-900 dark:to-black">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Platform Analitik Data Industri</h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Eksplorasi data industri, lihat tren historis, dan prediksi lahan kosong yang berpotensi untuk pengembangan kawasan industri.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/data" className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200">
              <Database className="h-4 w-4" />
              Katalog Data
            </Link>
            <Link href="/prediksi" className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
              <Map className="h-4 w-4" />
              Prediksi Lahan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-300/40 via-cyan-300/40 to-transparent blur-3xl dark:from-indigo-500/20 dark:via-cyan-500/20" />
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200/60 p-6 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Data Historis Industri</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Sektor, tenaga kerja, nilai produksi, dan lokasi pabrik dari berbagai tahun.</p>
        </div>
        <div className="rounded-xl border border-zinc-200/60 p-6 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Analisis Lahan dan Infrastruktur</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Tutupan lahan, jaringan jalan, utilitas, dan regulasi peruntukan lahan.</p>
        </div>
      </div>
    </section>
  );
}
