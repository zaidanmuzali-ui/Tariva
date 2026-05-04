import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, DollarSign, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../lib/store';
import { toast } from 'sonner';

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-3">
      {[
        { label: 'Hari', value: timeLeft.days },
        { label: 'Jam', value: timeLeft.hours },
        { label: 'Mnt', value: timeLeft.minutes },
        { label: 'Dtk', value: timeLeft.seconds },
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="bg-slate-900 text-white w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-sm md:text-base font-black shadow-lg">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export function Pricing({ onBack, onContact }: { onBack: () => void, onContact?: () => void }) {
  const { user, language } = useAppStore();
  const [loadingPro, setLoadingPro] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const monthlyPrice = 79000;
  const yearlyPrice = 806200;
  const currentPrice = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;

  useEffect(() => {
    // Load Midtrans Snap Script
    const midtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
    const scriptUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    let script = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.src = scriptUrl;
      script.setAttribute('data-client-key', midtransClientKey || '');
      script.async = true;
      document.body.appendChild(script);
    }

    // No need to manually check session here as store handles it
  }, [user]);

  const isPro = user?.user_metadata?.plan === 'pro';

  const handleUpgradeToPro = async () => {
    // PROMO: Bypass payment logic
    toast.success('Promo: Semua fitur PRO saat ini terbuka untuk umum!');
    onBack();
    return;
  };

  const sectionAnimate = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-20 space-y-16 md:space-y-24">
      <motion.section {...sectionAnimate} className="text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center bg-primary-light text-primary-brand rounded-full text-xs sm:text-sm font-semibold px-3 py-1 md:px-4 md:py-1.5 mx-auto">
          Pilih Paket Anda
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight px-2">
          Daftar Harga & Paket Layanan TARIVA
        </h1>

        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto px-4">
          Nikmati akses penuh ke semua fitur premium secara gratis selama periode promosi berlangsung.
        </p>

        <div className="flex flex-col items-center gap-6 pt-4">
          <div className="text-sm md:text-base font-bold text-slate-600">Semua fitur Pro terbuka gratis sampai 11 Mei 2026:</div>
          <Countdown targetDate="2026-05-11T00:00:00" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto items-stretch pt-4 md:pt-8">
          {/* FREE CARD */}
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full text-left">
            <div className="p-6 md:p-10 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-bold text-slate-800">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-black text-slate-900">Rp 0</span>
                </div>
                <p className="text-slate-500 text-xs md:text-sm">Untuk memulai</p>
              </div>

              <div className="h-px bg-slate-100" />

              <ul className="space-y-3 md:space-y-4">
                {[
                  { text: "Pencarian HS Code tanpa batas", check: true },
                  { text: "Kode 8-digit + tarif dasar (BM, PPN, PPnBM)", check: true },
                  { text: "Regulasi & lartas — ringkasan", check: true },
                  { text: "Akses Negara: Hanya 'Other/General'", check: true },
                  { text: "Simpan hingga 5 hasil", check: true },
                  { text: "Kalkulator estimasi biaya impor", check: false },
                  { text: "Daftar dokumen lengkap", check: false },
                  { text: "Trade insights & tren pasar", check: false },
                  { text: "Export PDF", check: false },
                  { text: "Semua negara tujuan (9 negara)", check: false },
                  { text: "Riwayat pencarian unlimited", check: false },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm">
                    {item.check ? (
                      <CheckCircle2 size={16} className="text-primary-brand/80 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={item.check ? "text-slate-700 font-medium" : "text-slate-400"}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 md:p-10 pt-0 mt-auto">
              <Button onClick={onBack} variant="outline" className="w-full h-11 md:h-12 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50">
                Mulai Gratis
              </Button>
            </div>
          </div>

          {/* PRO CARD */}
          <div className="relative h-full text-left group mt-4 md:mt-0">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-primary-brand text-[10px] uppercase tracking-widest font-black px-4 md:px-5 py-1 md:py-1.5 rounded-full z-20 shadow-lg border border-primary-brand/20">
              Paling Populer
            </div>
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border-2 border-primary-brand overflow-hidden shadow-xl shadow-primary-brand/5 flex flex-col h-full ring-4 ring-blue-600/5">
              <div className="bg-primary-brand p-6 md:p-10 pb-6 md:pb-8 text-white space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-bold">Pro</h3>

                  {/* Integrated Toggle */}
                  <div className="bg-primary-dark/50 p-1 rounded-full flex items-center relative h-8 md:h-9 border border-primary-brand/50/30">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 md:px-4 text-[9px] md:text-[10px] uppercase tracking-wider font-black transition-all relative z-10 h-full rounded-full ${billingCycle === 'monthly' ? 'text-primary-brand' : 'text-white/80/60'}`}
                    >
                      Bln
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-3 md:px-4 text-[9px] md:text-[10px] uppercase tracking-wider font-black transition-all relative z-10 h-full rounded-full ${billingCycle === 'yearly' ? 'text-primary-brand' : 'text-white/80/60'}`}
                    >
                      Thn
                    </button>
                    <motion.div
                      layoutId="billingToggleInCard"
                      className="absolute bg-white rounded-full h-[calc(100%-8px)]"
                      initial={false}
                      animate={{
                        left: billingCycle === 'monthly' ? 4 : 'auto',
                        right: billingCycle === 'yearly' ? 4 : 'auto',
                        width: 'calc(50% - 6px)'
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-black">
                      GRATIS
                    </span>
                    <span className="text-white/80 text-sm md:text-base font-normal">/sampai 11 Mei</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {billingCycle === 'yearly' ? (
                      <motion.p
                        key="yearly-sub"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="text-emerald-300 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                      >
                        <CheckCircle2 size={10} />
                        Tagihan Rp {yearlyPrice.toLocaleString('id-ID')} / thn (Hemat ~17%)
                      </motion.p>
                    ) : (
                      <motion.p
                        key="monthly-sub"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="text-white/80 text-xs md:text-sm"
                      >
                        Untuk bisnis yang serius ekspor-impor
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-6 md:p-10 space-y-6 flex-grow">
                <ul className="space-y-3 md:space-y-4">
                  <li className="font-bold text-slate-900 text-xs md:text-sm mb-4">Semua fitur Free, ditambah:</li>
                  {[
                    "Kalkulator estimasi biaya impor",
                    "Daftar dokumen lengkap & spesifik",
                    "Trade insights & tren pasar",
                    "Export PDF hasil pencarian",
                    "Semua 9 negara tujuan",
                    "Riwayat pencarian unlimited",
                    "Prioritas akses fitur baru"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm">
                      <CheckCircle2 size={16} md:size={18} className="text-primary-brand/80 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 md:p-10 pt-0 mt-auto text-center">
                <Button
                  onClick={isPro ? undefined : handleUpgradeToPro}
                  disabled={loadingPro || isPro}
                  className={`${isPro ? 'bg-accent-success' : 'bg-primary-brand hover:bg-primary-dark'} text-white font-bold w-full h-11 md:h-12 rounded-xl transition-all shadow-lg flex items-center justify-center`}
                >
                  {loadingPro ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  {isPro ? 'Paket Pro Aktif' : 'Coba Fitur Pro Sekarang'}
                </Button>
                {!isPro && (
                  <div className="space-y-3 mt-4">
                    <p className="text-[10px] md:text-xs text-slate-400 leading-tight">Pesan aman lewat Midtrans Payment Gateway.</p>
                    <button
                      onClick={async () => {
                        if (!user) return;
                        toast.info('Menyinkronkan status dengan server...');
                        try {
                          // Try to find the latest order specifically for this user
                          const { data: latestPayment } = await supabase
                            .from('payments')
                            .select('invoice_number')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false })
                            .limit(1);

                          const orderId = latestPayment?.[0]?.invoice_number || localStorage.getItem(`last_order_${user.id}`);
                          const { data: { session } } = await supabase.auth.getSession();

                          const response = await fetch('/api/sync-pro', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${session?.access_token}`
                            },
                            body: JSON.stringify({ orderId })
                          });
                          const result = await response.json();

                          if (result.status === 'upgraded') {
                            toast.success('Status Pro aktif! Memuat ulang profil...');
                            await new Promise(r => setTimeout(r, 1000));
                            await supabase.auth.refreshSession();
                            window.location.reload();
                          } else {
                            toast.error('Status Pro belum terdeteksi. Silakan coba bayar kembali atau hubungi bantuan.');
                          }
                        } catch (e) {
                          toast.error('Gagal menghubungi server sinkronisasi.');
                        }
                      }}
                      className="text-[10px] text-primary-brand font-bold hover:underline"
                    >
                      Sudah bayar tapi masih terkunci? Klik untuk sinkronisasi
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section {...sectionAnimate} className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-slate-900">Pertanyaan Umum</h2>
          <p className="text-slate-500">Segala hal yang perlu Anda ketahui tentang paket dan layanan kami.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: "Apakah HS Code yang dihasilkan TARIVA 100% akurat?",
              a: "TARIVA menggunakan AI yang dilatih dengan data Buku Tarif Kepabeanan Indonesia (BTKI). Meskipun akurasinya sangat tinggi, kami menyarankan untuk selalu melakukan verifikasi akhir dengan modul Bea Cukai atau bertanya kepada konsultan ahli sebelum melakukan transaksi fisik bernilai besar."
            },
            {
              q: "Apa keuntungan utama menggunakan Paket Pro?",
              a: "Paket Pro memberikan akses ke kalkulator estimasi biaya impor, daftar dokumen spesifik per komoditas, trade insights, export PDF, dan kemampuan mencari HS Code spesifik untuk 9 negara mitra dagang utama Indonesia."
            },
            {
              q: "Apakah pembayaran melalui Midtrans aman?",
              a: "Sangat aman. Midtrans adalah payment gateway resmi (bagian dari GoTo Financial) yang diawasi oleh Bank Indonesia. Kami menggunakan enkripsi standar industri dan tidak pernah menyimpan data kartu atau kredensial bank Anda di server kami."
            },
            {
              q: "Bagaimana cara upgrade dari paket Free ke Pro?",
              a: "Cukup klik tombol 'Mulai Pro' di atas. Anda akan diarahkan ke halaman pembayaran resmi Midtrans. Setelah pembayaran berhasil, sistem kami akan secara otomatis mengaktifkan fitur Pro di akun Anda dalam hitungan detik."
            },
            {
              q: "Apakah saya bisa membatalkan langganan?",
              a: "Ya, Anda dapat mengelola langganan Anda kapan saja melalui dashboard profil. Jika Anda membatalkan, fitur Pro Anda tetap akan aktif hingga masa periode penagihan saat ini berakhir."
            }
          ].map((faq, index) => (
            <FAQItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </motion.section>

      {/* Closing */}
      <motion.section {...sectionAnimate} className="bg-slate-900 rounded-[2.5rem] p-10 md:p-20 text-white text-center space-y-10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
        <h2 className="text-3xl font-black relative z-10">Punya pertanyaan lebih lanjut?</h2>
        <p className="text-slate-400 max-w-lg mx-auto relative z-10">Tim kami siap membantu Anda memilih paket yang paling tepat untuk skala bisnis Anda.</p>
        <Button
          variant="outline"
          onClick={onContact}
          className="relative z-10 border-white/20 text-white bg-transparent hover:bg-white/10 rounded-xl px-8 h-12 font-bold"
        >
          Hubungi Sales Team
        </Button>
      </motion.section>

      <footer className="text-center pb-12">
        <Button onClick={onBack} variant="link" className="text-primary-brand font-bold mb-8">
          Kembali ke Pencarian
        </Button>
        <div className="flex items-center justify-center gap-3 mb-4 opacity-30 grayscale invert">
          <img src="/LOGO.png" alt="TARIVA" className="h-6 w-auto" />
          <span className="font-black tracking-[0.2em] text-sm">TARIVA</span>
        </div>
        <p className="text-slate-400 text-xs">© 2024 TARIVA. Built with trade pride in Indonesia.</p>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string; key?: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-blue-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 group"
      >
        <span className="font-bold text-slate-800 group-hover:text-primary-brand transition-colors">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-primary-brand text-white' : 'bg-slate-50 text-slate-400'}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-slate-500 leading-relaxed text-sm">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
