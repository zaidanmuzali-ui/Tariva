import React from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Globe, 
  Scale, 
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function About({ onBack, onPricing }: { onBack: () => void, onPricing: () => void }) {
  // Common animation config
  const sectionAnimate = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-24 md:space-y-32">
      {/* SECTION 1 — HERO */}
      <motion.section {...sectionAnimate} className="text-center space-y-8">
        <div className="inline-flex items-center bg-primary-light text-primary-brand rounded-full text-sm font-semibold px-4 py-1.5 mx-auto">
          Tentang TARIVA
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight whitespace-pre-line">
          Solusi <span className="text-primary-brand">HS Code BTKI 2022</span>{"\n"}untuk Ekspor & Impor.
        </h1>
        
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Misi kami adalah mendemokratisasi akses ke sistem kepabeanan Indonesia. 
          TARIVA membantu Anda menemukan kode klasifikasi barang dengan cepat menggunakan data resmi BTKI 2022 dan regulasi INSW.
        </p>

        <div className="flex flex-wrap gap-6 justify-center mt-6">
          {[
            "Sesuai KUMHS Resmi",
            "Database BTKI 2022",
            "Data Real-time INSW"
          ].map((text, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <CheckCircle2 size={16} className="text-primary-brand" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={onBack}
          className="bg-primary-brand hover:bg-primary-dark text-white font-bold rounded-xl px-8 h-11 transition-all mt-4"
        >
          Coba Sekarang — Gratis
          <ArrowRight className="ml-2" size={18} />
        </Button>
      </motion.section>

      {/* SECTION 2 — PAIN POINTS */}
      <motion.section {...sectionAnimate} className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-slate-900">Kenapa HS Code menjadi momok UMKM?</h2>
          <p className="text-lg text-slate-500">Bukan karena produknya salah — tapi karena sistemnya tidak ramah.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <AlertTriangle className="text-amber-500" />,
              bg: "bg-amber-50",
              title: "Bahasa hukum yang tidak manusiawi",
              body: "BTKI 2022 memiliki ribuan pos tarif dengan istilah teknis yang bahkan membingungkan pengusaha berpengalaman. Satu kata yang salah bisa mengubah klasifikasi — dan tarifnya."
            },
            {
              icon: <Clock className="text-red-500" />,
              bg: "bg-red-50",
              title: "Butuh hari, bukan menit",
              body: "Mencari di portal INSW, baca manual BTKI, konsultasi forwarder, lalu masih tidak yakin hasilnya benar. Proses yang harusnya 30 menit bisa memakan 3 hari kerja."
            },
            {
              icon: <ShieldAlert className="text-purple-500" />,
              bg: "bg-purple-50",
              title: "Konsekuensi yang tidak main-main",
              body: "Denda administrasi, pemeriksaan fisik panjang, barang tertahan di pelabuhan berminggu-minggu — semuanya bisa terjadi hanya karena satu kode yang berbeda."
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 3 — HOW TARIVA WORKS */}
      <motion.section {...sectionAnimate} className="bg-slate-50 rounded-[2.5rem] p-8 md:p-14 lg:p-20 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-slate-900">Bagaimana TARIVA bekerja?</h2>
          <p className="text-lg text-slate-500">Tiga langkah. Satu menit. Hasil yang bisa langsung dipakai.</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-12 md:gap-8 relative">
          {[
            {
              num: "01",
              icon: <MessageSquare />,
              title: "Deskripsikan produkmu",
              body: "Ketik nama produk dalam bahasa sehari-hari. Tidak perlu istilah teknis. TARIVA mengerti konteks.",
              chip: "Contoh: sepatu kulit pria ukuran 40–44"
            },
            {
              num: "02",
              icon: <Sparkles />,
              title: "AI analisis menggunakan KUMHS",
              body: "TARIVA menerapkan Ketentuan Umum Menginterpretasi Harmonized System (KUMHS) 1–6 — aturan resmi Bea Cukai RI — untuk menentukan kode yang tepat.",
              chip: "Contoh: Analisis bahan, fungsi, dan spesifikasi produk"
            },
            {
              num: "03",
              icon: <CheckCircle2 />,
              title: "Dapatkan hasil lengkap",
              body: "Kode HS 8-digit, tarif bea masuk, PPN, lartas, dokumen yang dibutuhkan, dan konteks negara tujuan — semuanya dalam satu tampilan.",
              chip: "Contoh: HS 6403.91.00, BM 15%, PPN 11%"
            }
          ].map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="flex-1 flex flex-col space-y-5 relative z-10">
                <div className="absolute -top-10 -left-4 text-7xl md:text-8xl font-black text-blue-200/40 select-none pointer-events-none">
                  {item.num}
                </div>
                
                <div className="w-14 h-14 bg-primary-brand rounded-2xl flex items-center justify-center text-white relative z-10 shadow-xl shadow-primary-brand/30">
                  {React.cloneElement(item.icon as React.ReactElement, { size: 28 })}
                </div>
                
                <div className="space-y-3 relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-sm lg:text-base">
                    {item.body}
                  </p>
                </div>

                <div className="pt-2 mt-auto">
                  <div className="inline-flex items-center text-[10px] md:text-[11px] bg-white border border-slate-200 rounded-full px-4 py-1.5 text-slate-500 font-bold uppercase tracking-wider shadow-sm">
                    {item.chip}
                  </div>
                </div>
              </div>
              
              {idx < 2 && (
                <div className="hidden md:flex items-center justify-center flex-shrink-0 opacity-20">
                   <ArrowRight size={24} className="text-slate-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.section>

      {/* SECTION 5 (Renumbered to 4) — TRUST / SOURCES */}
      <motion.section {...sectionAnimate} className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-slate-900">Dibangun di atas data resmi</h2>
          <p className="text-lg text-slate-500">Bukan interpretasi pihak ketiga — langsung dari sumbernya.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <BookOpen />,
              title: "BTKI 2022",
              body: "Buku Tarif Kepabeanan Indonesia edisi terbaru yang ditetapkan melalui PMK 26/PMK.010/2022 oleh Kementerian Keuangan RI."
            },
            {
              icon: <Globe />,
              title: "Portal INSW",
              body: "Indonesia National Single Window — data lartas, tarif, dan regulasi ekspor-impor yang diperbarui secara real-time oleh pemerintah."
            },
            {
              icon: <Scale />,
              title: "Aturan KUMHS",
              body: "Ketentuan Umum Menginterpretasi Harmonized System — 6 aturan resmi WCO yang digunakan Bea Cukai seluruh dunia untuk klasifikasi barang."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-[2rem] p-8 space-y-6">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary-brand">
                {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 6 (Renumbered to 5) — CLOSING CTA */}
      <motion.section 
        {...sectionAnimate}
        className="bg-slate-900 rounded-[2.5rem] p-10 md:p-20 text-white text-center space-y-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white">Siap ekspor tanpa was-was?</h2>
          <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
            Dibangun untuk UMKM Indonesia yang ingin ekspor lebih aman.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={onBack}
            className="bg-primary-brand hover:bg-primary-dark text-white rounded-2xl px-10 h-14 text-lg font-bold transition-all shadow-xl shadow-primary-brand/20"
          >
            Mulai Gratis Sekarang
          </Button>
          <Button 
            variant="ghost" 
            onClick={onPricing}
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl h-14 px-8 text-lg font-medium"
          >
            Lihat Paket Pro <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </motion.section>

      {/* Footer Branding */}
      <footer className="text-center pb-12">
        <div className="flex items-center justify-center gap-3 mb-4 opacity-30 grayscale invert">
          <img src="/LOGO.png" alt="TARIVA" className="h-6 w-auto" />
          <span className="font-black tracking-[0.2em] text-sm">TARIVA</span>
        </div>
        <p className="text-slate-400 text-xs">© 2024 TARIVA. Built with trade pride in Indonesia.</p>
      </footer>
    </div>
  );
}
