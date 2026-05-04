import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, ArrowLeft, Loader2, Mail, User, MessageSquare, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ContactSales({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, this would call an API route that sends an email
      // For now, we'll simulate the success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Sales Inquiry:', formData);
      setSubmitted(true);
      toast.success('Pesan berhasil terkirim!');
    } catch (error) {
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-50 text-accent-success rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Pesan Terkirim!</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Terima kasih telah menghubungi Sales Team TARIVA. Kami akan meninjau permintaan Anda dan menghubungi Anda kembali melalui email dalam waktu 24 jam.
          </p>
          <Button 
            onClick={onBack}
            className="bg-slate-900 text-white rounded-xl px-8 h-12 font-bold mt-4"
          >
            Kembali
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-50">
          <ArrowLeft size={16} />
        </div>
        Kembali
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center bg-primary-light text-primary-brand rounded-full text-xs font-black uppercase tracking-widest px-4 py-1.5">
              Sales Inquiry
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Bawa UMKM Anda ke Level Global
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              Diskusikan kebutuhan spesifik bisnis Anda dengan tim ahli kami. Kami siap membantu Anda menavigasi kompleksitas perdagangan internasional.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: CheckCircle2, text: "Solusi enterprise untuk volume pencarian tinggi" },
              { icon: CheckCircle2, text: "Integrasi API kustom untuk sistem logistik Anda" },
              { icon: CheckCircle2, text: "Konsultasi regulasi ekspor-impor eksklusif" },
              { icon: CheckCircle2, text: "Pelatihan tim untuk klasifikasi HS Code" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon size={20} className="text-primary-brand/80 flex-shrink-0" />
                <span className="text-slate-700 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-2xl relative"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  required
                  placeholder="Budi Santoso"
                  className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Bisnis</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email"
                  required
                  placeholder="budi@perusahaan.com"
                  className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Perusahaan (Opsional)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Globe size={18} />
                </div>
                <input 
                  type="text"
                  placeholder="Maju Bersama"
                  className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pesan / Kebutuhan</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea 
                  required
                  placeholder="Bagaimana kami bisa membantu bisnis Anda?"
                  rows={4}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium resize-none"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary-brand hover:bg-primary-dark text-white font-bold h-14 rounded-xl shadow-lg shadow-primary-brand/20 transition-all flex items-center justify-center gap-2 group mt-4 text-lg"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  Kirim Pesan
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </Button>
            
            <p className="text-[10px] text-slate-400 text-center font-medium">
              Data Anda aman dan tidak akan dibagikan ke pihak ketiga.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
