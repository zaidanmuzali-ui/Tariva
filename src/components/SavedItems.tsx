import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Trash2, ArrowRight, Globe, Loader2, Search, ExternalLink, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { HSResult } from '../types';
import { ResultDetail } from './ResultDetail';
import { User } from '@supabase/supabase-js';

interface SavedItem {
  id: string;
  hscode: string;
  description: string;
  country: string;
  trade_mode: string;
  query: string;
  full_data?: HSResult;
  created_at: string;
}

interface SavedItemsProps {
  onBack: () => void;
  user?: User | null;
}

export function SavedItems({ onBack }: { onBack: () => void }) {
  const { user } = useAppStore();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);

  const isPro = user?.user_metadata?.plan === 'pro';

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_hs_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error(error);
      if (error.code === '42P01') {
        toast.error("Tabel 'saved_hs_codes' tidak ditemukan.");
      } else {
        toast.error("Gagal mengambil data koleksi.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('saved_hs_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      toast.success("Item dihapus dari koleksi.");
    } catch (error: any) {
      toast.error("Gagal menghapus item.");
    } finally {
      setDeletingId(null);
    }
  };

  if (selectedItem) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedItem(null)}
          className="text-slate-500 hover:text-primary-brand font-bold mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Kembali ke Koleksi
        </Button>

        {selectedItem.full_data ? (
          <ResultDetail 
            result={selectedItem.full_data} 
            country={selectedItem.country}
            tradeMode={selectedItem.trade_mode as 'import' | 'export'}
            user={user}
            isSavedMode={true}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                <Search className="text-slate-300" size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">Detail Tidak Tersedia</h3>
             <p className="text-slate-500 max-w-sm mx-auto">
               Item ini disimpan sebelum fitur detail lengkap tersedia. Anda hanya dapat melihat informasi dasar di daftar koleksi.
             </p>
             <Button onClick={() => setSelectedItem(null)} variant="outline" className="rounded-xl px-8">
               Tutup
             </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
            <Bookmark className="text-primary-brand mr-3" size={32} />
            Koleksi Tersimpan
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500">Daftar kode HS referensi cepat.</p>
            {!isPro && (
              <span className="px-2 py-0.5 bg-primary-light text-primary-brand rounded-md text-[10px] font-bold border border-primary-brand/20 flex items-center gap-1.5 whitespace-nowrap">
                <Info size={10} />
                Limit: {items.length}/5 Tersimpan
              </span>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="border-slate-200 rounded-xl"
        >
          Kembali Cari
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="animate-spin text-primary-brand mb-4" size={40} />
            <p className="text-slate-400 font-medium">Memuat koleksi Anda...</p>
          </motion.div>
        ) : items.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {items.map((item) => (
              <Card 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="group border-slate-200 hover:border-blue-200 cursor-pointer hover:shadow-xl hover:shadow-primary-brand/5 transition-all rounded-2xl overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xl font-bold text-primary-brand">{item.hscode}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.trade_mode === 'import' ? 'bg-primary-light text-primary-dark' : 'bg-orange-100 text-orange-700'}`}>
                          {item.trade_mode === 'import' ? 'Impor' : 'Ekspor'}
                        </span>
                        {item.full_data && (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                            Detail Lengkap
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-800 line-clamp-1">{item.description}</CardTitle>
                      <CardDescription className="text-xs flex items-center">
                        <Globe size={12} className="mr-1" />
                        {item.country} • {item.query}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={deletingId === item.id}
                      onClick={(e) => handleDelete(e, item.id)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                    >
                      {deletingId === item.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4 flex justify-between items-center text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    Disimpan {new Date(item.created_at).toLocaleDateString('id-ID')}
                    <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <a 
                    href={`https://insw.go.id/btki?hs_code=${item.hscode}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary-brand font-bold flex items-center hover:underline"
                  >
                    Cek INSW
                    <ExternalLink size={10} className="ml-1" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bookmark className="text-slate-200" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Belum Ada Koleksi</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">Anda belum menyimpan hasil pencarian apapun. Cari produk dan klik "Simpan" untuk menambahkannya ke sini.</p>
            <Button 
              onClick={onBack}
              className="mt-6 bg-primary-brand hover:bg-primary-dark text-white font-bold rounded-xl px-8"
            >
              Mulai Cari
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
