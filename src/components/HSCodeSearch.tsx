import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Info, ArrowRight, ShieldCheck, Globe, Database, XCircle, MessageSquare, Calculator, TrendingUp, Lightbulb, Sparkles, Bookmark, FileDown, ChevronDown, CheckCircle2, ChevronRight, ThumbsUp, ThumbsDown, ArrowLeft, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { openrouterService } from '@/src/services/openrouterService';
import { supabase } from '@/src/lib/supabase';
import { useAppStore } from '@/src/lib/store';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '@supabase/supabase-js';

import { ResultDetail } from './ResultDetail';
import { HSResult } from '../types';

export function HSCodeSearch() {
  const { user, language, setLanguage } = useAppStore();
  const isPro = user?.user_metadata?.plan === 'pro';
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [results, setResults] = useState<HSResult[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [guestSearchCount, setGuestSearchCount] = useState<number>(0);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('tariva_guest_searches') || '0');
    setGuestSearchCount(count);
  }, []);

  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tradeMode, setTradeMode] = useState<'import' | 'export'>('import');
  const [selectedCountry, setSelectedCountry] = useState<string>('Other/General');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const countries = ['China', 'Japan', 'South Korea', 'United States', 'Singapore', 'Malaysia', 'India', 'Australia', 'Other/General'];

  useEffect(() => {
    if (!isPro && selectedCountry !== 'Other/General') {
      setSelectedCountry('Other/General');
    }
  }, [isPro]);

  // Clarification Flow State
  const [questions, setQuestions] = useState<{ text: string, options: string[] }[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [showOtherInput, setShowOtherInput] = useState<boolean[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const t = {
    id: {
      heroTitle: "Tau HS Code Produkmu dalam 30 Detik",
      heroSub: "Tidak perlu jadi ahli bea cukai. Cukup jelaskan produkmu dalam beberapa kata, Tariva akan temukan kode HS yang tepat beserta tarif dan dokumen yang dibutuhkan.",
      searchPlaceholder: "Ketik nama produk yang ingin Anda ekspor/impor...",
      example: "Contoh produk:",
      searchBtn: "Cari",
      searching: "Sedang mencari...",
      impor: "Impor",
      ekspor: "Ekspor",
      asal: "Asal",
      tujuan: "Tujuan",
      cancel: "Batalkan",
      switchLang: "English Version"
    },
    en: {
      heroTitle: "Find Your HS Code in 30 Seconds",
      heroSub: "No need to be a customs expert. Just describe your product, and Tariva will find the right HS code, tariffs, and required documents.",
      searchPlaceholder: "Type the product name you want to export/import...",
      example: "Examples:",
      searchBtn: "Search",
      searching: "Searching...",
      impor: "Import",
      ekspor: "Export",
      asal: "Origin",
      tujuan: "Destination",
      cancel: "Cancel",
      switchLang: "Versi Indonesia"
    }
  }[language];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setQuestions([]);
    setAnswers([]);
    setSearchHistory([]);
    await executeSearch(query);
  };

  const executeSearch = async (searchQuery: string, followUpMode = false, existingHistory: any[] = []) => {
    if (!searchQuery.trim()) return;

    // 0. Auth Check with Guest Limit
    const { data: { session } } = await supabase.auth.getSession();
    const PROMO_ACTIVE = true; // Set to false to revert

    if (!session && !PROMO_ACTIVE) {
      const guestCounter = parseInt(localStorage.getItem('tariva_guest_searches') || '0');
      if (guestCounter >= 3) {
        toast.error("Batas pencarian tamu (3 kali) telah tercapai. Silakan Masuk untuk melanjutkan pencarian tanpa batas.", {
          duration: 5000,
        });
        return;
      }
      // Increment counter for guest
      const newCount = guestCounter + 1;
      localStorage.setItem('tariva_guest_searches', newCount.toString());
      setGuestSearchCount(newCount);
      
      if (newCount === 1) {
        toast.info("Anda menggunakan sesi tamu. Tersedia 2 pencarian gratis lagi sebelum harus login.");
      } else if (newCount === 2) {
        toast.info("Sesi tamu: Tersedia 1 pencarian gratis lagi.");
      }
    }

    // Reset previous results if not follow up
    if (!followUpMode) {
      setResults([]);
      setAiInsight(null);
      setSelectedIdx(0);
      setCurrentQuestionIdx(0);
    }

    setLoading(true);
    setLoadingMessage('Memulai pencarian...');
    
    // Auto scroll to results/loading area
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Accumulate history
      let combinedHistory = [...existingHistory];
      if (followUpMode && questions.length > 0) {
        const currentQA = questions.map((q, i) => ({
          question: q.text,
          answer: answers[i]
        })).filter(qa => qa.answer && qa.answer.trim());
        combinedHistory = [...searchHistory, ...currentQA];
        setSearchHistory(combinedHistory);
      }

      const aiResponse = await openrouterService.smartSearch(
        searchQuery, 
        controller.signal, 
        combinedHistory.length > 0 ? combinedHistory.map(h => `${h.question}: ${h.answer}`) : undefined,
        selectedCountry,
        tradeMode,
        (msg) => setLoadingMessage(msg)
      );
      
      if (aiResponse.error === "RATE_LIMIT") {
        toast.error("Lalu lintas AI sedang padat (Rate Limit). Harap tunggu sejenak sebelum mencoba lagi.", {
          duration: 5000,
        });
        setAiInsight(aiResponse.explanation);
        return;
      }

      if (aiResponse.error === "TIMEOUT") {
        toast.error("Timeout: Permintaan terlalu lama. Silakan coba lagi.");
        return;
      }

      if (aiResponse.error === "CANCELLED") {
        return;
      }
      
      if (aiResponse.error === "GENERAL_ERROR") {
        toast.error(aiResponse.explanation || "Terjadi kesalahan saat memproses jawaban AI.");
        setAiInsight(aiResponse.explanation);
        return;
      }

      // Safeguard against search results where hscode might be missing or wrongly formatted
      const validatedResults = (aiResponse.results || []).map((r: any) => ({
        ...r,
        hscode: r.hscode || r.hs_code || "0000.00.00"
      }));

      const hasQuestions = aiResponse.questions && aiResponse.questions.length > 0;

      if (hasQuestions) {
        // Confidence rendah & ada pertanyaan → tampilkan pertanyaan klarifikasi dulu
        // Hasil sementara (jika ada) akan ditimpa setelah user menjawab pertanyaan
        setQuestions(aiResponse.questions);
        setAnswers(new Array(aiResponse.questions.length).fill(''));
        setShowOtherInput(new Array(aiResponse.questions.length).fill(false));
        setAiInsight(aiResponse.explanation);
        setResults([]); // Clear partial results agar UI hanya tampilkan pertanyaan
        toast.info(`Confidence ${aiResponse.confidence || 0}% — informasi kurang spesifik. Mohon jawab pertanyaan klarifikasi untuk hasil lebih akurat.`);
      } else {
         if (validatedResults.length === 0) {
           toast.error("AI tidak menemukan hasil klasifikasi yang valid. Coba gunakan deskripsi lain.");
         }
         setAiInsight(aiResponse.explanation);
         setResults(validatedResults);
         setQuestions([]); // Clear questions if results are confident enough
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan pencarian AI. Silakan coba lagi.");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      abortControllerRef.current = null;
      toast.info("Pencarian dibatalkan.");
    }
  };

  const handleAnswerChange = (idx: number, val: string) => {
    const newAnswers = [...answers];
    newAnswers[idx] = val;
    setAnswers(newAnswers);
  };

  const isResubmitDisabled = answers.length === 0 || answers.some(a => !a.trim());

  const handleConfirm = async () => {
    const result = results[selectedIdx];
    if (!result) return;
    setConfirming(true);
    const res = await openrouterService.saveFeedback(query, result.hscode, result.description);
    if (res.success) {
      toast.success("Klasifikasi berhasil dikonfirmasi dan disimpan sebagai referensi.");
    } else {
      toast.error("Gagal menyimpan konfirmasi.");
    }
    setConfirming(false);
  };
  
  const handleSave = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast.error("Silakan masuk terlebih dahulu untuk menyimpan hasil.");
      return;
    }

    const result = results[selectedIdx];
    if (!result) return;
    
    setSaving(true);
    try {
      // Check limit for free users
      if (!isPro) {
        const { count, error: countError } = await supabase
          .from('saved_hs_codes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id);
        
        if (countError) throw countError;
        
        if (count !== null && count >= 5) {
          toast.error("Batas simpan akun Free tercapai (Maks 5). Silakan upgrade ke Pro untuk simpan tanpa batas.", {
            action: {
              label: 'Upgrade',
              onClick: () => window.dispatchEvent(new CustomEvent('navigate-pricing'))
            },
            duration: 5000
          });
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from('saved_hs_codes')
        .insert([
          {
            user_id: authUser.id,
            hscode: result.hscode,
            description: result.description,
            country: selectedCountry,
            trade_mode: tradeMode,
            query: query,
            full_data: result,
            created_at: new Date().toISOString(),
          }
        ]);
      
      if (error) throw error;
      toast.success("Berhasil disimpan ke koleksi Anda!");
    } catch (error: any) {
      console.error(error);
      // If table doesn't exist, provide clear instruction
      if (error.code === '42P01') {
        toast.error("Tabel 'saved_hs_codes' belum dibuat di database.");
      } else {
        toast.error("Gagal menyimpan hasil: " + (error.message || "Unknown error"));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const result = results[selectedIdx];
    if (!result) {
      toast.error("Data hasil tidak tersedia untuk eksport.");
      return;
    }

    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('TARIVA', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Laporan Hasil Klasifikasi HS Code', 20, 32);
      
      const dateStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      doc.text(`Dicetak pada: ${dateStr}`, pageWidth - 20, 32, { align: 'right' });

      // HS Code & Description Section
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMASI PRODUK', 20, 55);
      
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(20, 58, pageWidth - 20, 58);

      doc.setFontSize(28);
      doc.setTextColor(37, 99, 235); // Blue 600
      doc.text(result.hscode, 20, 75);

      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.setFont('helvetica', 'normal');
      const splitDesc = doc.splitTextToSize(result.description, pageWidth - 40);
      doc.text(splitDesc, 20, 85);

      let currentY = 85 + (splitDesc.length * 7);

      // Info Chips
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Mode: ${tradeMode === 'import' ? 'Impor' : 'Ekspor'}`, 20, currentY + 10);
      doc.text(`Negara: ${selectedCountry}`, 80, currentY + 10);
      doc.text(`Sumber Data: BTKI 2022`, pageWidth - 20, currentY + 10, { align: 'right' });

      currentY += 25;

      // Tariffs Table
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('Rincian Tarif & Pajak', 20, currentY);
      
      const tariffData = tradeMode === 'import' ? [
        ['Bea Masuk', result.import_duty],
        ['PPN Impor', result.vat],
        ['PPnBM', result.ppnhb]
      ] : [
        ['Bea Keluar', result.export_tariff]
      ];

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Komponen', 'Tarif']],
        body: tariffData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 20, right: 20 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Regulations
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Regulasi & Lartas', 20, currentY);
      
      const regData = [
        ['Ketentuan Indonesia', result.regulations.join(', ') || '-'],
        [`Ketentuan ${selectedCountry}`, result.country_regulations?.join(', ') || '-']
      ];

      autoTable(doc, {
        startY: currentY + 5,
        body: regData,
        theme: 'grid',
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 20, right: 20 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Required Documents
      if (result.docs) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Dokumen yang Diperlukan', 20, currentY);
        
        const docData = [
          ['Dokumen Dasar', result.docs.basic.join(', ')],
          ['Dokumen Pengiriman', result.docs.shipping.join(', ')],
          ['Dokumen Khusus', result.docs.specific.join(', ')]
        ];

        autoTable(doc, {
          startY: currentY + 5,
          body: docData,
          theme: 'plain',
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
          },
          margin: { left: 20, right: 20 }
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Plain Explanation
      if (result.plain_explanation) {
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Penjelasan', 20, currentY);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitExplanation = doc.splitTextToSize(result.plain_explanation, pageWidth - 40);
        doc.text(splitExplanation, 20, currentY + 7);
      }

      // Footer disclaimer
      const footerY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Disclaimer: Data ini dihasilkan oleh AI Tariva berdasarkan BTKI 2022. Harap verifikasi kembali dengan pihak berwenang.', pageWidth / 2, footerY, { align: 'center' });

      doc.save(`TARIVA_HSCODE_${result.hscode}.pdf`);
      toast.success("PDF berhasil di-export!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal meng-export PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-10 pb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="inline-block px-3 py-1 bg-primary-light text-primary-brand text-[11px] font-bold tracking-widest uppercase rounded-full border border-primary-brand/10 mb-2">
            Didukung BTKI 2022 Resmi Bea Cukai RI
          </span>
          <h1 className="text-4xl md:text-[56px] font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
            Ekspor & Impor Jadi<br />
            <span className="text-primary-brand">Lebih Mudah & Aman.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Didesain khusus untuk UMKM. Cari HS Code BTKI 2022, cek tarif bea masuk, dan lartas tanpa perlu keahlian kepabeanan.
          </p>
        </motion.div>
      </div>

      {/* Redesigned Search Section */}
      <div className="max-w-3xl mx-auto w-full px-4 -mt-6">
        {/* Guest Limit Indicator */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border border-primary-brand/10 rounded-2xl mb-4 shadow-[0_4px_20px_rgba(8,112,184,0.06)]"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${guestSearchCount >= 3 ? 'bg-red-50 text-red-500' : 'bg-primary-light text-primary-brand'}`}>
                {guestSearchCount >= 3 ? <XCircle size={16} /> : <Zap size={16} fill="currentColor" />}
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-900 leading-tight">
                  {guestSearchCount >= 3 
                    ? 'Batas pencarian tercapai' 
                    : `Sisa ${3 - guestSearchCount} pencarian gratis`}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {guestSearchCount >= 3 
                    ? 'Silakan masuk untuk melanjutkan' 
                    : 'Masuk untuk pencarian tanpa batas'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'register' } }))}
              className="h-8 rounded-lg text-xs font-black border-primary-brand/20 text-primary-brand hover:bg-primary-brand hover:text-white transition-all bg-white shadow-sm"
            >
              Daftar Sekarang
            </Button>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(8,112,184,0.12)] border border-border-brand/40 p-2 md:p-3"
        >
          <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <div className="absolute left-6 top-5 sm:top-auto text-slate-400 hidden sm:block">
              <Search size={22} strokeWidth={2.5} />
            </div>
            <Input 
              className="w-full h-14 sm:h-16 sm:pl-16 sm:pr-48 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary-brand/10 text-base sm:text-lg placeholder:text-slate-400 font-medium rounded-2xl"
              placeholder={language === 'id' ? "Contoh: Biji kopi luwak sangrai..." : "Example: Roasted coffee beans..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="sm:absolute sm:right-1.5 p-1 sm:p-0">
              <Button 
                type="submit"
                disabled={loading}
                className="bg-primary-brand text-base font-black text-white h-12 sm:h-14 w-full sm:w-auto sm:px-10 rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary-brand/30 flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                {language === 'id' ? 'Cari HS Code' : 'Identify HS Code'}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Search Options Below Input */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Mode Toggle (Segmented Control style) */}
            <div className="inline-flex p-1 bg-primary-light/50 border border-primary-brand/10 rounded-xl">
              <button 
                onClick={() => setTradeMode('import')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  tradeMode === 'import' 
                    ? 'bg-primary-brand text-white shadow-sm' 
                    : 'text-text-secondary hover:text-primary-brand'
                }`}
              >
                Impor
              </button>
              <button 
                onClick={() => setTradeMode('export')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  tradeMode === 'export' 
                    ? 'bg-primary-brand text-white shadow-sm' 
                    : 'text-text-secondary hover:text-primary-brand'
                }`}
              >
                Ekspor
              </button>
            </div>

            {/* Country Selector */}
            <div className="relative group">
              <div className="flex items-center px-4 py-2.5 bg-white border border-border-brand rounded-xl hover:border-primary-brand/50 transition-colors cursor-pointer min-w-[160px]">
                <span className="text-base mr-2 flex-shrink-0">
                  {selectedCountry === 'China' ? '🇨🇳' : 
                   selectedCountry === 'Japan' ? '🇯🇵' :
                   selectedCountry === 'South Korea' ? '🇰🇷' :
                   selectedCountry === 'United States' ? '🇺🇸' :
                   selectedCountry === 'Singapore' ? '🇸🇬' :
                   selectedCountry === 'Malaysia' ? '🇲🇾' : '🌎'}
                </span>
                <select 
                  value={selectedCountry}
                  onChange={(e) => {
                    if (!isPro && e.target.value !== 'Other/General') {
                      toast.info("Fitur Negara Spesifik memerlukan akun Pro", {
                        action: {
                          label: 'Upgrade',
                          onClick: () => window.dispatchEvent(new CustomEvent('navigate-pricing'))
                        }
                      });
                      return;
                    }
                    setSelectedCountry(e.target.value);
                  }}
                  className="bg-transparent text-sm font-semibold text-text-main outline-none appearance-none pr-6 cursor-pointer"
                >
                  {countries.map(c => (
                    <option key={c} value={c} disabled={!isPro && c !== 'Other/General'}>
                      {c} {!isPro && c !== 'Other/General' ? ' (Pro)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 text-text-muted group-hover:text-primary-brand transition-colors pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-text-muted mr-1">Contoh:</span>
            {['Sepatu kulit pria', 'Kopi arabika', 'Handphone second', 'Minyak sawit'].map(tag => (
              <button 
                key={tag} 
                className="px-3 py-1.5 rounded-full border border-border-brand text-[11px] font-semibold text-text-secondary hover:bg-primary-light hover:text-primary-brand hover:border-primary-brand transition-all cursor-pointer" 
                onClick={() => { 
                  setQuery(tag); 
                  setQuestions([]);
                  setAnswers([]);
                  executeSearch(tag); 
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Content Grid */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto w-full py-20 px-6 scroll-mt-20"
          >
            <div className="bg-white rounded-3xl p-10 border border-border-brand shadow-sm text-center relative overflow-hidden">
              {/* Progress Line */}
              <div className="absolute top-0 left-0 h-1 bg-primary-brand transition-all duration-1000 ease-out" style={{ width: loadingMessage.includes('tarif') ? '100%' : loadingMessage.includes('KUMHS') ? '66%' : '33%' }}></div>
              
              <div className="space-y-10">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-primary-brand/10 rounded-2xl animate-ping opacity-25"></div>
                    {loadingMessage.includes('tarif') ? <ShieldCheck className="text-primary-brand" size={32} /> : 
                     loadingMessage.includes('KUMHS') ? <Sparkles className="text-primary-brand" size={32} /> : 
                     <Database className="text-primary-brand" size={32} />}
                  </div>
                  <h3 className="text-xl font-bold text-text-main">Analisis Sedang Berjalan</h3>
                  <p className="text-text-secondary text-sm max-w-xs mx-auto mt-2">Tariva sedang memproses deskripsi produk Anda dengan aturan BTKI terbaru.</p>
                </div>

                <div className="space-y-4 text-left max-w-xs mx-auto">
                   {[
                     { label: "Mengambil data BTKI...", icon: Database, stage: 1 },
                     { label: "Menganalisis menggunakan KUMHS...", icon: Sparkles, stage: 2 },
                     { label: "Memeriksa regulasi & tarif terkini...", icon: ShieldCheck, stage: 3 }
                   ].map((step, i) => {
                     const isCurrent = (i === 0 && loadingMessage.includes('Memulai')) || 
                                     (i === 1 && loadingMessage.includes('KUMHS')) || 
                                     (i === 2 && loadingMessage.includes('tarif'));
                     const isDone = (i === 0 && (loadingMessage.includes('KUMHS') || loadingMessage.includes('tarif'))) ||
                                  (i === 1 && loadingMessage.includes('tarif'));
                     
                     return (
                       <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${isCurrent ? 'opacity-100 scale-105' : isDone ? 'opacity-50' : 'opacity-30'}`}>
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? 'bg-accent-success/10 text-accent-success' : isCurrent ? 'bg-primary-brand text-white shadow-md' : 'bg-bg-app text-text-muted'}`}>
                           {isDone ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                         </div>
                         <span className={`text-[13px] font-semibold ${isCurrent ? 'text-text-main' : 'text-text-secondary'}`}>{step.label}</span>
                       </div>
                     );
                   })}
                </div>

                <Button 
                  variant="ghost" 
                  onClick={handleCancel}
                  className="text-text-muted hover:text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-widest gap-2"
                >
                  <XCircle size={14} />
                  Batalkan Pencarian
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clarification Questions UI (Conversational Style) */}
        {!loading && questions.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto w-full px-4 scroll-mt-20"
          >
            <div className="bg-white rounded-3xl border border-border-brand shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="bg-bg-app p-6 border-b border-border-brand flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-xl border border-border-brand flex items-center justify-center shadow-sm">
                   <img src="/LOGO.png" className="h-8 w-auto" alt="" />
                </div>
                <div>
                  <h3 className="font-bold text-text-main leading-tight">Konsultan AI Tariva</h3>
                  <div className="flex items-center text-[10px] text-accent-success font-bold uppercase tracking-wider">
                     <span className="w-1.5 h-1.5 bg-accent-success rounded-full mr-1.5 animate-pulse"></span>
                     Online & Menganalisis
                  </div>
                </div>
                <div className="ml-auto text-xs font-bold text-text-muted bg-primary-light px-3 py-1 rounded-full">
                  Langkah {currentQuestionIdx + 1} dari {questions.length}
                </div>
              </div>

              <div className="p-8 space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-primary-brand uppercase tracking-widest">Pertanyaan Klarifikasi</span>
                      <p className="text-xl font-bold text-text-main leading-snug">
                        {questions[currentQuestionIdx].text}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {questions[currentQuestionIdx].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => {
                            handleAnswerChange(currentQuestionIdx, opt);
                            if (currentQuestionIdx < questions.length - 1) {
                              setCurrentQuestionIdx(prev => prev + 1);
                            }
                          }}
                          className={`w-full text-left px-5 py-4 rounded-xl border-1.5 transition-all flex items-center justify-between group ${
                            answers[currentQuestionIdx] === opt 
                              ? 'bg-primary-light border-primary-brand text-primary-brand shadow-sm' 
                              : 'bg-white border-border-brand hover:border-primary-brand/50 text-text-secondary hover:text-text-main'
                          }`}
                        >
                          <span className="font-semibold">{opt}</span>
                          <ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${answers[currentQuestionIdx] === opt ? 'text-primary-brand' : 'text-text-muted opacity-0 group-hover:opacity-100'}`} />
                        </button>
                      ))}
                      
                      <button
                        onClick={() => {
                          const newOther = [...showOtherInput];
                          newOther[currentQuestionIdx] = true;
                          setShowOtherInput(newOther);
                        }}
                        className={`w-full text-left px-5 py-4 rounded-xl border-1.5 transition-all text-text-muted hover:text-text-main border-dashed border-border-brand hover:border-primary-brand/50 mt-2 ${showOtherInput[currentQuestionIdx] ? 'bg-bg-app border-primary-brand border-solid' : 'hover:bg-bg-app'}`}
                      >
                         <span className="font-semibold">+ Tulis keterangan lainnya...</span>
                      </button>

                      {showOtherInput[currentQuestionIdx] && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 'auto', height: 'auto' }} className="pt-2">
                           <Input 
                             value={answers[currentQuestionIdx] || ''} 
                             onChange={(e) => handleAnswerChange(currentQuestionIdx, e.target.value)}
                             placeholder="Ketik detail di sini..."
                             className="h-12 rounded-xl bg-bg-app border-primary-brand/30 shadow-inner"
                             autoFocus
                           />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-6 border-t border-border-brand flex items-center justify-between">
                   <div className="flex gap-1.5">
                      {questions.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentQuestionIdx ? 'w-6 bg-primary-brand' : i < currentQuestionIdx ? 'bg-primary-brand/40' : 'bg-border-brand'}`}></div>
                      ))}
                   </div>
                   <div className="flex gap-3">
                      {currentQuestionIdx > 0 && (
                        <Button 
                          variant="outline" 
                          className="font-bold border-border-brand text-text-secondary px-6 rounded-xl hover:bg-primary-light hover:text-primary-brand transition-all"
                          onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                        >
                          Sebelumnya
                        </Button>
                      )}
                      {currentQuestionIdx < questions.length - 1 ? (
                        <Button 
                          disabled={!answers[currentQuestionIdx]?.trim()}
                          className="bg-primary-brand text-white font-bold px-8 rounded-xl"
                          onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        >
                          Selanjutnya
                        </Button>
                      ) : (
                        <Button 
                          disabled={isResubmitDisabled}
                          onClick={() => executeSearch(query, true)}
                          className="bg-primary-brand text-white font-bold px-8 rounded-xl animate-in fade-in zoom-in duration-300"
                        >
                          Kirim Analisis
                        </Button>
                      )}
                      
                      {currentQuestionIdx === 0 && (
                        <Button variant="ghost" className="text-text-muted font-bold px-4" onClick={() => setQuestions([])}>
                          Batal
                        </Button>
                      )}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && questions.length === 0 && results.length === 0 && aiInsight && (
          <motion.div 
            ref={resultsRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto w-full px-4 scroll-mt-20"
          >
             <Card className="border-red-200 bg-red-50/50 shadow-sm">
               <CardHeader className="pb-3">
                 <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                   <Info size={20} />
                   Pencarian Belum Berhasil
                 </CardTitle>
               </CardHeader>
               <CardContent className="text-red-800 text-sm leading-relaxed">
                 <p>{aiInsight}</p>
                 <div className="mt-6">
                   <Button onClick={() => { setAiInsight(null); setQuery(''); }} className="bg-red-100 text-red-700 hover:bg-red-200 border-none font-semibold">
                     Coba Pencarian Baru
                   </Button>
                 </div>
               </CardContent>
             </Card>
          </motion.div>
        )}

        {!loading && questions.length === 0 && results.length > 0 && results[selectedIdx] && (
          <motion.div 
            ref={resultsRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-8 scroll-mt-20"
          >
            {/* Result Selection Tabs */}
            {results.length > 1 && (
              <div className="max-w-4xl mx-auto w-full px-4 mb-2">
                <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-[20px] border border-border-brand/50 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <div className="flex-shrink-0 px-3 py-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest border-r border-border-brand/50 mr-1">
                    Hasil<br/>Analisis
                  </div>
                  <div className="flex items-center gap-2">
                    {results.map((res, idx) => (
                      <button
                        key={(res.hscode || 'unknown') + idx}
                        onClick={() => setSelectedIdx(idx)}
                        className={`flex-shrink-0 px-5 py-3 rounded-2xl border transition-all flex flex-col items-start gap-0.5 group relative ${
                          selectedIdx === idx 
                            ? 'bg-primary-brand text-white border-primary-brand shadow-lg shadow-primary-brand/20' 
                            : 'bg-white text-text-secondary border-border-brand hover:border-primary-brand/50 hover:bg-primary-light/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black opacity-60 uppercase tracking-tighter">Match {idx + 1}</span>
                          {selectedIdx === idx && (
                            <motion.div layoutId="active-dot" className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-sm md:text-base font-bold tracking-tight">
                          {res.hscode || '0000.00.00'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <ResultDetail 
              result={results[selectedIdx]} 
              country={selectedCountry}
              tradeMode={tradeMode}
              user={user}
              onSave={handleSave}
              onExport={handleExportPDF}
              onConfirm={handleConfirm}
              onBack={() => { setResults([]); setAiInsight(null); }}
              saving={saving}
              exporting={exporting}
              confirming={confirming}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
