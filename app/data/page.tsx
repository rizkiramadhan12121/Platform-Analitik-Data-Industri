import Link from "next/link";

const datasets = [
  { id: "industry_sites", name: "Lokasi Industri", description: "Koordinat, sektor, kapasitas, dan status operasional", href: "/data/industry_sites.json" },
  { id: "land_parcels", name: "Parsel Lahan", description: "Luas, peruntukan, kepadatan, dan tingkat keterbangunan", href: "/data/land_parcels.json" },
  { id: "roads", name: "Jaringan Jalan", description: "Tol dan arteri utama untuk akses logistik", href: "/data/roads.json" },
  { id: "utilities_power", name: "Listrik (GI/PLTU)", description: "Substasi dan pembangkit listrik beserta kapasitas", href: "/data/utilities_power.json" },
  { id: "utilities_water", name: "Air Bersih (IPA)", description: "Instalasi pengolahan air dan kapasitas layanan", href: "/data/utilities_water.json" },
  { id: "ports_airports", name: "Pelabuhan & Bandara", description: "Akses distribusi ekspor-impor dan mobilitas", href: "/data/ports_airports.json" },
  { id: "population_density", name: "Kepadatan Penduduk", description: "Penduduk per km2 sebagai indikator tekanan lahan", href: "/data/population_density.json" },
  { id: "gdp_regional", name: "PDRB Regional", description: "Aktivitas ekonomi wilayah untuk daya tarik investasi", href: "/data/gdp_regional.json" },
  { id: "education_facilities", name: "Fasilitas Pendidikan", description: "SMK, Politeknik, Universitas pendukung tenaga kerja", href: "/data/education_facilities.json" },
  { id: "hospitals", name: "Rumah Sakit", description: "Ketersediaan layanan kesehatan untuk ekosistem kawasan", href: "/data/hospitals.json" },
  { id: "zoning_rtrw", name: "Zonasi RTRW", description: "Peruntukan lahan resmi (industri, permukiman, campuran)", href: "/data/zoning_rtrw.json" },
  { id: "landcover", name: "Tutupan Lahan", description: "Built-up, pertanian, RTH sebagai konteks lingkungan", href: "/data/landcover.json" },
  { id: "flood_risk", name: "Risiko Banjir", description: "Indeks risiko untuk kelayakan pengembangan", href: "/data/flood_risk.json" },
  { id: "umkm_centers", name: "Sentra UMKM", description: "Ekosistem UKM yang mendukung rantai pasok", href: "/data/umkm_centers.json" },
  { id: "elevation_slope", name: "Elevasi & Kemiringan", description: "Elevasi (m) dan slope (%) per lokasi", href: "/data/elevation_slope.json" },
  { id: "soil_types", name: "Jenis Tanah", description: "Tipe tanah dominan untuk konstruksi", href: "/data/soil_types.json" },
  { id: "rainfall", name: "Curah Hujan", description: "Rata-rata tahunan (mm) per wilayah", href: "/data/rainfall.json" },
  { id: "air_quality", name: "Kualitas Udara (AQI)", description: "Indeks kualitas udara dari stasiun pemantau", href: "/data/air_quality.json" },
  { id: "noise_levels", name: "Kebisingan", description: "Level kebisingan (dB) area perkotaan", href: "/data/noise_levels.json" },
  { id: "protected_areas", name: "Kawasan Lindung", description: "Area konservasi dan ruang hijau", href: "/data/protected_areas.json" },
  { id: "telecom_coverage", name: "Cakupan Telekomunikasi", description: "Operator 4G/5G dan persentase cakupan", href: "/data/telecom_coverage.json" },
  { id: "fiber_nodes", name: "Node Fiber Optik", description: "Lokasi node dan provider", href: "/data/fiber_nodes.json" },
  { id: "warehouses", name: "Gudang", description: "Kapasitas gudang distribusi", href: "/data/warehouses.json" },
  { id: "logistics_hubs", name: "Hub Logistik", description: "Pusat distribusi dan pergudangan", href: "/data/logistics_hubs.json" },
  { id: "industrial_permits", name: "Perizinan Industri", description: "Status perizinan kawasan/area industri", href: "/data/industrial_permits.json" },
  { id: "land_price_index", name: "Indeks Harga Lahan", description: "Estimasi harga per m2 per area", href: "/data/land_price_index.json" },
  { id: "unemployment_rate", name: "Tingkat Pengangguran", description: "Persentase pengangguran per wilayah", href: "/data/unemployment_rate.json" },
  { id: "labor_education", name: "Lulusan Vokasi", description: "Perkiraan lulusan vokasi per tahun", href: "/data/labor_education.json" },
  { id: "energy_prices", name: "Tarif Listrik", description: "Tarif listrik rata-rata per kWh", href: "/data/energy_prices.json" },
  { id: "waste_facilities", name: "Fasilitas Limbah", description: "TPST/TPA/IPAS untuk pengelolaan limbah", href: "/data/waste_facilities.json" },
  { id: "water_sources", name: "Sumber Air", description: "Sungai/sumber air untuk suplai", href: "/data/water_sources.json" },
  { id: "railways", name: "Rel Kereta", description: "Jalur rel utama untuk logistik", href: "/data/railways.json" },
  { id: "gas_pipelines", name: "Pipa Gas", description: "Jalur pipa gas dan kapasitas", href: "/data/gas_pipelines.json" },
  { id: "customs_offices", name: "Kantor Bea Cukai", description: "Lokasi layanan ekspor-impor", href: "/data/customs_offices.json" },
];

export default function DataCatalogPage() {
  return (
    <section className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Katalog Data</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Kumpulan data untuk analitik industri, infrastruktur, spasial, dan sosial-ekonomi.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {datasets.map((d) => (
          <div key={d.id} className="rounded-xl border border-zinc-200/60 p-6 dark:border-zinc-800">
            <h2 className="text-lg font-medium">{d.name}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{d.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <Link href={d.href} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white dark:bg-zinc-100 dark:text-black">Unduh</Link>
              <Link href={`/prediksi?dataset=${d.id}`} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-900 dark:border-zinc-700 dark:text-zinc-200">Gunakan untuk Prediksi</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-indigo-200/50 bg-indigo-50 p-6 text-sm dark:border-indigo-800/50 dark:bg-indigo-900/20">
        <p>Disarankan menambahkan data utilitas, zonasi RTRW, akses transportasi, risiko lingkungan, dan indikator ekonomi untuk meningkatkan akurasi prediksi.</p>
      </div>
    </section>
  );
}