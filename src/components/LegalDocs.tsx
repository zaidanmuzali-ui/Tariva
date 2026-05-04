import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LegalSection = 'privacy' | 'terms' | 'payment';

export function LegalDocs({ onBack, initialSection = 'privacy' }: { onBack: () => void, initialSection?: LegalSection }) {
  const [activeSection, setActiveSection] = React.useState<LegalSection>(initialSection);

  // Sync state if initialSection changes (e.g. clicking footer links while already on legal page)
  React.useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const containerAnimate = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary-brand font-bold text-sm hover:gap-3 transition-all mb-4"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Dokumen Legal</h1>
          <p className="text-slate-500">Kebijakan, Syarat, dan Ketentuan Layanan TARIVA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveSection('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeSection === 'privacy' 
                ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/20' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Shield size={18} />
            Privasi
          </button>
          <button
            onClick={() => setActiveSection('terms')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeSection === 'terms' 
                ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/20' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <FileText size={18} />
            Syarat
          </button>
          <button
            onClick={() => setActiveSection('payment')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeSection === 'payment' 
                ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/20' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <CreditCard size={18} />
            Pembayaran
          </button>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm min-h-[600px]">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-strong:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600"
          >
            {activeSection === 'privacy' && <PrivacyContent />}
            {activeSection === 'terms' && <TermsContent />}
            {activeSection === 'payment' && <PaymentContent />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <>
      <h2 className="text-2xl font-black mb-6">Kebijakan Privasi TARIVA</h2>
      <p><strong>Terakhir diperbarui: April 2026</strong></p>
      
      <hr className="my-8 border-slate-100" />

      <h3>1. Pendahuluan</h3>
      <p>
        Selamat datang di <strong>TARIVA</strong> ("kami", "layanan kami"). TARIVA adalah platform pencarian Kode HS (Harmonized System) berbasis kecerdasan buatan yang dioperasikan untuk membantu pelaku usaha dan individu di Indonesia dalam kegiatan kepabeanan.
      </p>
      <p>
        Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan layanan TARIVA, sesuai dengan:
      </p>
      <ul>
        <li><strong>UU No. 27 Tahun 2022</strong> tentang Perlindungan Data Pribadi (UU PDP)</li>
        <li><strong>PP No. 71 Tahun 2019</strong> tentang Penyelenggaraan Sistem dan Transaksi Elektronik</li>
      </ul>
      <p>
        Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan data sebagaimana dijelaskan dalam kebijakan ini.
      </p>

      <hr className="my-8 border-slate-100" />

      <h3>2. Data yang Kami Kumpulkan</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-slate-900">2.1 Data yang Anda Berikan Langsung</h4>
          <ul>
            <li><strong>Nama lengkap</strong> — saat mendaftar akun</li>
            <li><strong>Alamat email</strong> — untuk autentikasi dan komunikasi layanan</li>
            <li><strong>Data pembayaran</strong> — diproses melalui Midtrans (kami tidak menyimpan nomor kartu atau rekening Anda secara langsung)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900">2.2 Data yang Dikumpulkan Otomatis</h4>
          <ul>
            <li><strong>Riwayat pencarian HS Code</strong> — untuk meningkatkan akurasi hasil AI</li>
            <li><strong>Data penggunaan layanan</strong> — halaman yang dikunjungi, fitur yang digunakan, waktu akses</li>
            <li><strong>Informasi perangkat</strong> — jenis browser, sistem operasi, alamat IP</li>
            <li><strong>Cookies dan session token</strong> — untuk menjaga sesi login Anda</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900">2.3 Data dari Pihak Ketiga</h4>
          <ul>
            <li>Informasi profil dari Google/provider OAuth jika Anda login menggunakan akun Google</li>
          </ul>
        </div>
      </div>

      <hr className="my-8 border-slate-100" />

      <h3>3. Tujuan Penggunaan Data</h3>
      <p>Kami menggunakan data Anda untuk:</p>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-200 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-4 py-2 text-left">Tujuan</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Dasar Hukum</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Menyediakan dan mengoperasikan layanan TARIVA</td>
              <td className="border border-slate-200 px-4 py-2">Pelaksanaan kontrak</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Memproses pembayaran dan mengelola langganan</td>
              <td className="border border-slate-200 px-4 py-2">Pelaksanaan kontrak</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Mengirimkan notifikasi terkait akun dan layanan</td>
              <td className="border border-slate-200 px-4 py-2">Kepentingan sah</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Meningkatkan akurasi model AI pencarian HS Code</td>
              <td className="border border-slate-200 px-4 py-2">Kepentingan sah</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Mematuhi kewajiban hukum yang berlaku</td>
              <td className="border border-slate-200 px-4 py-2">Kewajiban hukum</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Mendeteksi dan mencegah penipuan atau penyalahgunaan</td>
              <td className="border border-slate-200 px-4 py-2">Kepentingan sah</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 italic">Kami <strong>tidak</strong> menggunakan data Anda untuk iklan pihak ketiga.</p>

      <hr className="my-8 border-slate-100" />

      <h3>4. Pihak Ketiga yang Menerima Data</h3>
      <p>Kami bekerja sama dengan pihak ketiga berikut dalam operasional layanan:</p>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-200 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-4 py-2 text-left">Pihak Ketiga</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Fungsi</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Kebijakan Privasi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-200 px-4 py-2"><strong>Supabase</strong></td>
              <td className="border border-slate-200 px-4 py-2">Database dan autentikasi</td>
              <td className="border border-slate-200 px-4 py-2">supabase.com/privacy</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2"><strong>Midtrans</strong></td>
              <td className="border border-slate-200 px-4 py-2">Pemrosesan pembayaran</td>
              <td className="border border-slate-200 px-4 py-2">midtrans.com/id/privacy-policy</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2"><strong>OpenRouter (Gemini, Llama, dll)</strong></td>
              <td className="border border-slate-200 px-4 py-2">Pemrosesan query pencarian AI dan rotasi model cerdas</td>
              <td className="border border-slate-200 px-4 py-2">openrouter.ai/privacy</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4">Kami memastikan pihak ketiga di atas memiliki standar perlindungan data yang memadai. Kami <strong>tidak menjual</strong> data pribadi Anda kepada pihak mana pun.</p>

      <hr className="my-8 border-slate-100" />

      <h3>5. Penyimpanan dan Keamanan Data</h3>
      <ul>
        <li>Data Anda disimpan di server Supabase dengan enkripsi standar industri.</li>
        <li>Kami menerapkan autentikasi berlapis (email/password + OAuth) untuk melindungi akun Anda.</li>
        <li>Data riwayat pencarian disimpan selama akun Anda aktif.</li>
        <li>Data akun yang dihapus akan dihapus permanen dalam <strong>30 hari</strong> setelah permintaan penghapusan.</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>6. Cookies</h3>
      <p>TARIVA menggunakan cookies untuk:</p>
      <ul>
        <li>Menjaga sesi login Anda (session cookies)</li>
        <li>Menyimpan preferensi tampilan</li>
        <li>Menganalisis penggunaan layanan secara anonim</li>
      </ul>
      <p>Anda dapat menonaktifkan cookies melalui pengaturan browser, namun beberapa fitur layanan mungkin tidak berfungsi optimal.</p>

      <hr className="my-8 border-slate-100" />

      <h3>7. Hak-Hak Anda</h3>
      <p>Sesuai UU PDP No. 27/2022, Anda berhak untuk:</p>
      <ul>
        <li><strong>Mengakses</strong> data pribadi yang kami simpan tentang Anda</li>
        <li><strong>Memperbaiki</strong> data yang tidak akurat</li>
        <li><strong>Menghapus</strong> akun dan data Anda ("right to be forgotten")</li>
        <li><strong>Menarik persetujuan</strong> atas penggunaan data tertentu</li>
        <li><strong>Mengajukan keberatan</strong> atas pemrosesan data Anda</li>
        <li><strong>Portabilitas data</strong> — mendapatkan salinan data Anda dalam format yang dapat dibaca</li>
      </ul>
      <p>Untuk menggunakan hak-hak di atas, hubungi kami di: <strong>privacy@tariva.id</strong></p>

      <hr className="my-8 border-slate-100" />

      <h3>8. Anak di Bawah Umur</h3>
      <p>Layanan TARIVA tidak ditujukan untuk pengguna di bawah usia 17 tahun. Kami tidak secara sengaja mengumpulkan data dari anak di bawah umur. Jika Anda mengetahui hal ini terjadi, segera hubungi kami.</p>

      <hr className="my-8 border-slate-100" />

      <h3>9. Perubahan Kebijakan</h3>
      <p>Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui email atau notifikasi di platform. Penggunaan layanan yang berkelanjutan setelah perubahan dianggap sebagai persetujuan.</p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <h2 className="text-2xl font-black mb-6">Syarat & Ketentuan Penggunaan TARIVA</h2>
      <p><strong>Terakhir diperbarui: April 2026</strong></p>
      
      <hr className="my-8 border-slate-100" />

      <h3>1. Penerimaan Syarat</h3>
      <p>
        Dengan mendaftar, mengakses, atau menggunakan layanan <strong>TARIVA</strong> ("Layanan"), Anda ("Pengguna") menyatakan telah membaca, memahami, dan menyetujui Syarat & Ketentuan ini secara penuh. Jika Anda tidak menyetujui syarat ini, mohon hentikan penggunaan Layanan.
      </p>
      <p>
        Syarat & Ketentuan ini merupakan perjanjian yang mengikat secara hukum antara Anda dan pengelola TARIVA, sesuai dengan hukum yang berlaku di Republik Indonesia.
      </p>

      <hr className="my-8 border-slate-100" />

      <h3>2. Deskripsi Layanan</h3>
      <p>
        TARIVA adalah platform berbasis kecerdasan buatan (AI) yang membantu pengguna menemukan <strong>Kode HS (Harmonized System / BTKI)</strong> yang relevan berdasarkan deskripsi produk, untuk keperluan ekspor-impor dan kepabeanan di Indonesia.
      </p>
      <p>Fitur yang tersedia:</p>
      <ul>
        <li>Pencarian HS Code berbasis AI (Melalui jaringan model OpenRouter)</li>
        <li>Kalkulator Estimasi Biaya Impor & Ekspor (Simulasi Bea Masuk, PPN, PPh 22, PPnBM)</li>
        <li>Akses basis data kepabeanan referensi (BTKI 2022)</li>
        <li>Penyimpanan hasil pencarian dan akses pencarian tanpa batas (fitur Pro)</li>
        <li>Riwayat pencarian personal</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>3. Pendaftaran Akun</h3>
      <ul>
        <li>Pengguna wajib menyediakan informasi yang <strong>akurat dan lengkap</strong> saat mendaftar.</li>
        <li>Setiap pengguna hanya boleh memiliki <strong>satu akun aktif</strong>.</li>
        <li>Anda bertanggung jawab menjaga kerahasiaan kata sandi akun Anda.</li>
        <li>TARIVA berhak menangguhkan atau menghapus akun yang menggunakan informasi palsu.</li>
        <li>Anda harus berusia minimal <strong>17 tahun</strong> untuk menggunakan Layanan.</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>4. Paket Layanan & Pembayaran</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-slate-900">4.1 Paket Gratis (Free) & Tamu (Guest)</h4>
          <ul>
            <li>Pengguna tamu tanpa akun dibatasi maksimal <strong>3 kali pencarian</strong></li>
            <li>Akses gratis dengan login memberikan pencarian tak terbatas namun dengan fitur dasar</li>
            <li>Tidak termasuk akses Kalkulator Estimasi Biaya Impor secara detail</li>
            <li>Fitur penyimpanan dibatasi sesuai ketentuan yang berlaku</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900">4.2 Paket Pro</h4>
          <ul>
            <li>Akses penuh ke seluruh fitur TARIVA</li>
            <li>Fitur simpan hasil dan riwayat pencarian lengkap</li>
            <li>Harga: <strong>Rp 79.000/bulan</strong> atau <strong>Rp 806.200/tahun</strong> (hemat 15%)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900">4.3 Pembayaran</h4>
          <ul>
            <li>Pembayaran diproses melalui <strong>Midtrans</strong> dengan berbagai metode (transfer bank, QRIS, e-wallet, kartu kredit)</li>
            <li>Langganan berlaku sejak tanggal pembayaran berhasil dikonfirmasi</li>
            <li>Kami berhak mengubah harga dengan pemberitahuan minimal <strong>30 hari</strong> sebelumnya</li>
          </ul>
        </div>
      </div>

      <hr className="my-8 border-slate-100" />

      <h3>5. Penggunaan yang Diizinkan</h3>
      <p>Pengguna diizinkan menggunakan TARIVA untuk:</p>
      <ul>
        <li>Mencari dan mengidentifikasi Kode HS untuk keperluan pribadi atau bisnis yang sah</li>
        <li>Referensi dan edukasi seputar kepabeanan Indonesia</li>
        <li>Keperluan internal perusahaan atau konsultan kepabeanan</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>6. Larangan Penggunaan</h3>
      <p>Pengguna <strong>dilarang keras</strong> melakukan hal berikut:</p>
      <ul>
        <li>Menggunakan bot, scraper, atau alat otomatis untuk mengambil data dari TARIVA secara massal</li>
        <li>Menjual kembali (resell) akses atau data yang diperoleh dari TARIVA</li>
        <li>Mencoba meretas, merusak, atau mengganggu infrastruktur Layanan</li>
        <li>Menggunakan Layanan untuk tujuan ilegal atau melanggar hukum yang berlaku</li>
        <li>Berbagi akun dengan pengguna lain</li>
        <li>Memalsukan identitas atau memanipulasi hasil pencarian</li>
        <li>Mengunggah konten berbahaya, SARA, atau melanggar hak cipta</li>
      </ul>
      <p>Pelanggaran terhadap larangan di atas dapat mengakibatkan penangguhan atau penghapusan akun secara permanen tanpa pengembalian dana.</p>

      <hr className="my-8 border-slate-100" />

      <h3>7. Disclaimer & Batasan Tanggung Jawab</h3>
      <p className="bg-amber-50 p-4 rounded-xl border border-amber-100 font-bold text-amber-900 border-l-4">
        ⚠️ <strong>PENTING:</strong> Hasil pencarian HS Code yang dihasilkan oleh TARIVA bersifat <strong>informatif semata</strong> dan <strong>bukan merupakan keputusan resmi</strong> dari Direktorat Jenderal Bea dan Cukai Republik Indonesia (DJBC).
      </p>
      <ul>
        <li>TARIVA menggunakan teknologi AI yang terus berkembang. Hasil pencarian mungkin tidak selalu 100% akurat.</li>
        <li>Fitur <strong>Kalkulator Estimasi Biaya Impor & Ekspor</strong> murni bersifat simulasi. Nilai tukar (kurs) dan persentase tarif bisa bervariasi. Estimasi yang dihasilkan tidak dapat dijadikan dasar pembayaran resmi.</li>
        <li>Pengguna <strong>wajib memverifikasi</strong> kode HS dan nilai tagihan pajak kepada DJBC atau konsultan kepabeanan berlisensi sebelum melakukan pembayaran resmi atau pengajuan dokumen kepabeanan (PIB/PEB).</li>
        <li>TARIVA tidak bertanggung jawab atas kerugian finansial, denda, salah tarif, atau sanksi yang timbul akibat penggunaan hasil pencarian tanpa verifikasi lebih lanjut.</li>
        <li>Layanan disediakan "sebagaimana adanya" (as-is) tanpa jaminan ketersediaan 100%.</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>8. Hak Kekayaan Intelektual</h3>
      <ul>
        <li>Seluruh konten, desain, kode, logo, dan merek dagang TARIVA adalah milik eksklusif pengelola TARIVA dan dilindungi hukum.</li>
        <li>Pengguna tidak memperoleh hak kepemilikan atas konten atau teknologi TARIVA.</li>
        <li>Data hasil pencarian yang tersimpan di akun pengguna adalah milik pengguna, namun tidak dapat digunakan untuk tujuan kompetitif atau komersial terhadap TARIVA.</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>9. Penghentian Layanan</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-slate-900">Oleh Pengguna</h4>
          <ul>
            <li>Pengguna dapat menonaktifkan akun kapan saja melalui pengaturan akun atau dengan menghubungi tim kami.</li>
            <li>Penghentian akun tidak otomatis memberikan hak refund untuk periode berlangganan yang sedang berjalan.</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900">Oleh TARIVA</h4>
          <ul>
            <li>Kami berhak menangguhkan atau menghentikan akun yang melanggar Syarat & Ketentuan ini.</li>
            <li>Dalam kasus penangguhan akibat pelanggaran, tidak ada pengembalian dana yang diberikan.</li>
            <li>TARIVA juga berhak menghentikan seluruh Layanan dengan pemberitahuan minimal <strong>30 hari</strong> kepada pengguna aktif berbayar.</li>
          </ul>
        </div>
      </div>

      <hr className="my-8 border-slate-100" />

      <h3>10. Hukum yang Berlaku & Penyelesaian Sengketa</h3>
      <ul>
        <li>Syarat & Ketentuan ini tunduk pada hukum Republik Indonesia.</li>
        <li>Segala sengketa yang timbul akan diselesaikan terlebih dahulu melalui musyawarah mufakat.</li>
        <li>Apabila tidak tercapai kesepakatan, sengketa akan diselesaikan melalui Badan Arbitrase Nasional Indonesia (BANI) atau Pengadilan Negeri yang berwenang.</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>11. Perubahan Syarat & Ketentuan</h3>
      <p>TARIVA berhak memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui email terdaftar atau notifikasi di platform setidaknya <strong>14 hari</strong> sebelum berlaku. Penggunaan Layanan yang berkelanjutan dianggap sebagai persetujuan atas perubahan tersebut.</p>
    </>
  );
}

function PaymentContent() {
  return (
    <>
      <h2 className="text-2xl font-black mb-6">Kebijakan Pembayaran & Pengembalian Dana TARIVA</h2>
      <p><strong>Terakhir diperbarui: April 2026</strong></p>
      
      <hr className="my-8 border-slate-100" />

      <h3>1. Metode Pembayaran</h3>
      <p>TARIVA memproses pembayaran melalui <strong>Midtrans</strong>, gateway pembayaran resmi yang terdaftar dan diawasi oleh Bank Indonesia. Metode pembayaran yang tersedia:</p>
      <ul>
        <li><strong>Transfer Bank</strong> — BCA, Mandiri, BNI, BRI, Permata</li>
        <li><strong>Virtual Account</strong> — semua bank utama Indonesia</li>
        <li><strong>QRIS</strong> — semua dompet digital yang mendukung QRIS</li>
        <li><strong>E-Wallet</strong> — GoPay, OVO, Dana, ShopeePay</li>
        <li><strong>Kartu Kredit/Debit</strong> — Visa, Mastercard</li>
      </ul>
      <p>Semua transaksi menggunakan mata uang <strong>Rupiah (IDR)</strong> dan dilindungi enkripsi SSL standar industri.</p>

      <hr className="my-8 border-slate-100" />

      <h3>2. Harga Paket Langganan</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-200 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-4 py-2 text-left">Paket</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Harga</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-200 px-4 py-2"><strong>Free</strong></td>
              <td className="border border-slate-200 px-4 py-2">Rp 0</td>
              <td className="border border-slate-200 px-4 py-2">Akses terbatas, tanpa kartu kredit</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2"><strong>Pro Bulanan</strong></td>
              <td className="border border-slate-200 px-4 py-2">Rp 79.000/bulan</td>
              <td className="border border-slate-200 px-4 py-2">Akses penuh, ditagih setiap bulan</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2"><strong>Pro Tahunan</strong></td>
              <td className="border border-slate-200 px-4 py-2">Rp 806.200/tahun</td>
              <td className="border border-slate-200 px-4 py-2">Hemat 15% dibanding bulanan</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 italic text-xs">Harga di atas <strong>sudah termasuk PPN</strong> (jika berlaku) sesuai regulasi perpajakan Indonesia.</p>

      <hr className="my-8 border-slate-100" />

      <h3>3. Siklus Penagihan</h3>
      <ul>
        <li>Langganan Pro Bulanan aktif selama <strong>30 hari</strong> sejak tanggal pembayaran.</li>
        <li>Langganan Pro Tahunan aktif selama <strong>365 hari</strong> sejak tanggal pembayaran.</li>
        <li>Langganan TARIVA saat ini <strong>tidak diperpanjang otomatis</strong> — pengguna perlu melakukan pembayaran ulang secara manual untuk memperpanjang.</li>
        <li>Pengguna akan menerima notifikasi email <strong>7 hari sebelum</strong> masa langganan berakhir.</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>4. Kebijakan Pengembalian Dana (Refund)</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-bold text-slate-900 mb-2 text-sm">4.1 Kondisi yang Memenuhi Syarat Refund</h4>
          <p>Pengembalian dana dapat dipertimbangkan dalam kondisi berikut:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-4 py-2 text-left">Kondisi</th>
                  <th className="border border-slate-200 px-4 py-2 text-left">Batas Waktu Pengajuan</th>
                  <th className="border border-slate-200 px-4 py-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 px-4 py-2">Kesalahan teknis sistem kami yang menyebabkan layanan tidak dapat diakses selama &gt;72 jam berturut-turut</td>
                  <td className="border border-slate-200 px-4 py-2">7 hari sejak insiden</td>
                  <td className="border border-slate-200 px-4 py-2">Refund proporsional sesuai hari tidak aktif</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-2">Pembayaran ganda (double charge) yang terbukti</td>
                  <td className="border border-slate-200 px-4 py-2">14 hari sejak transaksi</td>
                  <td className="border border-slate-200 px-4 py-2">Refund penuh untuk kelebihan bayar</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-4 py-2">Pembayaran berhasil namun akun tidak terupgrade</td>
                  <td className="border border-slate-200 px-4 py-2">7 hari sejak transaksi</td>
                  <td className="border border-slate-200 px-4 py-2">Refund penuh atau aktivasi manual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-2 text-sm">4.2 Kondisi yang TIDAK Memenuhi Syarat Refund</h4>
          <p>Pengembalian dana <strong>tidak dapat</strong> diproses untuk:</p>
          <ul>
            <li>Permintaan refund setelah masa berlaku syarat di atas</li>
            <li>Pengguna yang mengajukan refund dengan alasan "tidak cocok" atau "tidak jadi digunakan" setelah lebih dari 24 jam aktivasi</li>
            <li>Akun yang ditangguhkan akibat pelanggaran Syarat & Ketentuan</li>
            <li>Perbedaan ekspektasi terhadap hasil pencarian AI (karena sifat informatif AI)</li>
            <li>Perubahan kebutuhan bisnis pengguna</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-2 text-sm">4.3 Tidak Ada Free Trial Refund Guarantee</h4>
          <p>TARIVA menyediakan <strong>paket Free</strong> untuk mencoba layanan sebelum berlangganan. Karena itu, kami tidak menjamin refund dengan alasan "mencoba" layanan Pro.</p>
        </div>
      </div>

      <hr className="my-8 border-slate-100" />

      <h3>5. Cara Mengajukan Refund</h3>
      <ol>
        <li>Kirim email ke <strong>billing@tariva.id</strong> dengan subjek: <strong>[REFUND] - [ID Transaksi Anda]</strong></li>
        <li>Sertakan:
          <ul>
            <li>Nama lengkap dan email akun TARIVA</li>
            <li>ID transaksi dari email konfirmasi pembayaran</li>
            <li>Alasan pengajuan refund</li>
            <li>Bukti pendukung (screenshot, jika ada)</li>
          </ul>
        </li>
        <li>Tim kami akan merespons dalam <strong>3 hari kerja</strong></li>
        <li>Refund yang disetujui akan diproses dalam <strong>7–14 hari kerja</strong> tergantung metode pembayaran asal</li>
      </ol>

      <hr className="my-8 border-slate-100" />

      <h3>6. Proses Refund Berdasarkan Metode Pembayaran</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-200 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-4 py-2 text-left">Metode Pembayaran</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Estimasi Waktu Refund</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Kartu Kredit</td>
              <td className="border border-slate-200 px-4 py-2">7–14 hari kerja</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">Transfer Bank / Virtual Account</td>
              <td className="border border-slate-200 px-4 py-2">3–7 hari kerja</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">E-Wallet (GoPay, OVO, Dana)</td>
              <td className="border border-slate-200 px-4 py-2">1–3 hari kerja</td>
            </tr>
            <tr>
              <td className="border border-slate-200 px-4 py-2">QRIS</td>
              <td className="border border-slate-200 px-4 py-2">1–3 hari kerja</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 italic text-slate-500 text-xs">Waktu di atas bergantung juga pada kebijakan internal bank/provider masing-masing.</p>

      <hr className="my-8 border-slate-100" />

      <h3>7. Pajak</h3>
      <ul>
        <li>TARIVA wajib memungut <strong>Pajak Pertambahan Nilai (PPN)</strong> sesuai peraturan perpajakan Indonesia yang berlaku.</li>
        <li>Bukti transaksi dapat digunakan sebagai bukti pembayaran internal. Untuk kebutuhan faktur pajak resmi, hubungi kami di <strong>billing@tariva.id</strong>.</li>
      </ul>

      <hr className="my-8 border-slate-100" />

      <h3>8. Perselisihan Pembayaran (Dispute)</h3>
      <p>Jika Anda mengajukan chargeback atau dispute melalui bank/provider tanpa menghubungi kami terlebih dahulu, TARIVA berhak menangguhkan akun terkait selama proses investigasi berlangsung.</p>
      <p>Kami sangat menganjurkan Anda menghubungi tim kami terlebih dahulu sebelum mengajukan dispute melalui jalur bank, karena kami berkomitmen menyelesaikan masalah secara cepat dan adil.</p>
    </>
  );
}
