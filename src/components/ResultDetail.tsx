import React, { useState } from 'react';
import { 
  Info, 
  Calculator, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown, 
  Bookmark, 
  FileDown, 
  Sparkles,
  ArrowLeft,
  Lightbulb,
  Lock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HSResult } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { User } from '@supabase/supabase-js';

interface ResultDetailProps {
  result: HSResult;
  country: string;
  tradeMode: 'import' | 'export';
  user?: User | null;
  onSave?: () => void;
  onExport?: () => void;
  onConfirm?: () => void;
  onBack?: () => void;
  saving?: boolean;
  exporting?: boolean;
  confirming?: boolean;
  isSavedMode?: boolean;
}

export function ResultDetail({ 
  result, 
  country, 
  tradeMode, 
  user,
  onSave, 
  onExport, 
  onConfirm, 
  onBack,
  saving, 
  exporting, 
  confirming,
  isSavedMode = false
}: ResultDetailProps) {
  const [activeTab, setActiveTab] = useState<'regulations' | 'docs' | 'trends' | 'estimate'>('regulations');
  const isPro = user?.user_metadata?.plan === 'pro';

  // Helper to render blurred content
  const BlurredOverlay = ({ featureName }: { featureName: string }) => (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-primary-brand/30">
      <div className="text-center space-y-4 max-w-xs">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-200/50">
          <Lock size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-black text-slate-900">Fitur Pro</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {featureName} hanya tersedia untuk akun Pro. Tingkatkan akun Anda untuk akses penuh.
          </p>
        </div>
        <Button 
          onClick={() => (window as any).dispatchEvent(new CustomEvent('navigate-pricing'))}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-6 h-10 text-xs shadow-md shadow-amber-500/20"
        >
          Upgrade ke Pro
        </Button>
      </div>
    </div>
  );
  const [calcCurrency, setCalcCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [customValueIdr, setCustomValueIdr] = useState<number>(15000000);
  const [customValueUsd, setCustomValueUsd] = useState<number>(1000);
  const [customValueError, setCustomValueError] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Left Column: Main Card */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-3xl border border-border-brand overflow-hidden shadow-[0_12px_40px_rgba(28,95,165,0.06)] group">
          {/* Card Header (Deep Blue) */}
          <div className="bg-primary-brand p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <img src="/LOGO.png" className="w-24 h-auto brightness-0 invert" alt="" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl font-bold tracking-tight">
                  {result.hscode}
                </span>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  Konfiden 94%
                </div>
              </div>
              {result.fta_benefit && (
                <div className="flex items-center px-3 py-1.5 bg-amber-400/20 text-amber-100 rounded-lg border border-amber-400/30 text-[11px] font-bold uppercase tracking-wide">
                  <Sparkles size={12} className="mr-1.5" />
                  Ada Keuntungan FTA
                </div>
              )}
            </div>
            
            <p className="text-lg md:text-xl font-medium leading-snug opacity-90 max-w-2xl">
              {result.description}
            </p>
          </div>

          {/* Card Body: Info Grid */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Bea Masuk", value: result.import_duty, icon: Calculator },
                  { label: "PPN", value: result.vat, icon: Info },
                  { label: "PPnBM", value: result.ppnhb, icon: ShieldCheck },
                  { label: "Total Pajak", value: result.total_tariff, icon: TrendingUp, primary: true }
                ].map((block, i) => {
                  const Icon = block.icon;
                  return (
                  <div key={i} className={`p-4 rounded-2xl border transition-all flex flex-col items-start ${block.primary ? 'bg-primary-light/50 border-primary-brand/20 ring-1 ring-primary-brand/10 shadow-sm' : 'bg-bg-app border-border-brand hover:border-primary-brand/30 hover:bg-white shadow-sm'}`}>
                    <div className={`p-2 rounded-lg mb-3 ${block.primary ? 'bg-primary-brand text-white shadow-md' : 'bg-primary-light text-primary-brand'}`}>
                      <Icon size={18} />
                    </div>
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{block.label}</span>
                    <span className={`text-xl font-black ${block.primary ? 'text-primary-brand' : 'text-text-main'}`}>{block.value || '-'}</span>
                  </div>
                )})}
            </div>

            {/* Explanation Box */}
            {result.plain_explanation && (
              <div className="relative overflow-hidden group/box">
                <div className={`bg-primary-light border-l-4 border-primary-brand p-6 rounded-r-2xl flex gap-4 transition-all duration-500 ${!isPro ? 'blur-[8px] grayscale select-none pointer-events-none' : ''}`}>
                  <div className="mt-1 text-primary-brand flex-shrink-0">
                      <Info size={20} />
                  </div>
                  <div className="space-y-1">
                      <span className="text-[11px] font-black text-primary-brand uppercase tracking-widest">+ Analisis Artificial Intelligence</span>
                      <p className="text-text-main text-[15px] leading-relaxed font-medium italic opacity-90">
                        {result.plain_explanation}
                      </p>
                  </div>
                </div>
                {!isPro && <BlurredOverlay featureName="Analisis AI Mendalam" />}
              </div>
            )}

            {/* Detailed Tabs Area */}
            <div className="pt-4">
              <div className="flex bg-slate-50/50 p-1.5 rounded-2xl border border-border-brand/40 gap-1.5 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'regulations', label: 'Regulasi', icon: ShieldCheck },
                  { id: 'docs', label: 'Dokumen', icon: Bookmark },
                  { id: 'trends', label: 'Tren Pasar', icon: TrendingUp },
                  { id: 'estimate', label: 'Simulasi Pajak', icon: Calculator }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center gap-2 group ${
                        isActive 
                          ? 'bg-white text-primary-brand shadow-sm border border-primary-brand/10' 
                          : 'text-text-muted hover:text-text-secondary hover:bg-white/50'
                      }`}
                    >
                      <Icon size={14} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-primary-brand' : 'text-text-muted'}`} />
                      <span className="whitespace-nowrap">{tab.label}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="active-tab-indicator"
                          className="absolute bottom-1 w-5 h-0.5 bg-primary-brand rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                      {activeTab === 'regulations' && (
                        <div className="space-y-3">
                          {result.regulations.map((reg, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border-brand bg-white hover:border-primary-brand/30 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-warning flex items-center justify-center flex-shrink-0">
                                  <Info size={16} />
                                </div>
                                <span className="text-sm font-medium text-text-main leading-tight">{reg}</span>
                            </div>
                          ))}
                          {result.country_regulations?.map((reg, i) => (
                            <div key={`c-${i}`} className="flex items-center gap-4 p-4 rounded-xl border border-border-brand bg-white hover:border-primary-brand/30 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary-brand flex items-center justify-center flex-shrink-0">
                                  <Globe size={16} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{country}</span>
                                  <span className="text-sm font-medium text-text-main leading-tight">{reg}</span>
                                </div>
                            </div>
                          ))}
                          {result.regulations.length === 0 && (!result.country_regulations || result.country_regulations.length === 0) && (
                            <div className="py-10 text-center text-text-muted italic text-sm">Tidak ada larangan pembatasan khusus untuk HS Code ini.</div>
                          )}
                        </div>
                      )}

                      {activeTab === 'docs' && (
                        <div className="relative min-h-[200px] rounded-2xl overflow-hidden">
                          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 ${!isPro ? 'blur-xl grayscale select-none pointer-events-none' : ''}`}>
                            {[
                              { title: "Dokumen Dasar", items: result.docs?.basic },
                              { title: "Pengiriman", items: result.docs?.shipping },
                              { title: "Dokumen Khusus", items: result.docs?.specific }
                            ].map((col, i) => (
                              <div key={i} className="space-y-4">
                                  <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{col.title}</h4>
                                  <div className="space-y-2">
                                    {col.items?.map((item, j) => (
                                      <div key={j} className="flex items-start gap-2.5 text-sm font-medium text-text-main group">
                                        <div className="mt-0.5 w-4 h-4 rounded border border-primary-brand/30 bg-primary-brand flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                          <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                        <span>{item}</span>
                                      </div>
                                    ))}
                                  </div>
                              </div>
                            ))}
                          </div>
                          {!isPro && <BlurredOverlay featureName="Daftar Dokumen Lengkap" />}
                        </div>
                      )}

                      {activeTab === 'trends' && (
                        <div className="relative min-h-[150px] rounded-2xl overflow-hidden">
                          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-500 ${!isPro ? 'blur-xl grayscale select-none pointer-events-none' : ''}`}>
                            {[
                              { label: "Permintaan pasar", value: result.market_trends.demand, trend: 'up' },
                              { label: "Proyeksi 1 tahun", value: result.market_trends.projections, trend: 'stable' },
                              { label: "Fluktuasi harga", value: result.market_trends.price_fluctuation, trend: 'down' }
                            ].map((metric, i) => (
                              <div key={i} className="p-5 rounded-2xl border border-border-brand bg-bg-app">
                                  <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">{metric.label}</span>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-text-main">{metric.value}</span>
                                    <TrendingUp size={16} className={metric.trend === 'up' ? 'text-accent-success' : 'text-warning'} />
                                  </div>
                              </div>
                            ))}
                          </div>
                          {!isPro && <BlurredOverlay featureName="Analisis Tren Pasar" />}
                        </div>
                      )}

                      {activeTab === 'estimate' && (
                        <div className="relative min-h-[400px] rounded-2xl overflow-hidden">
                          <div className={`space-y-6 transition-all duration-500 ${!isPro ? 'blur-xl grayscale select-none pointer-events-none' : ''}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-primary-brand text-white gap-6">
                                <div className="space-y-1">
                                  <h4 className="font-bold text-lg leading-tight">Simulasi Tarif & Pajak</h4>
                                  <p className="text-white/70 text-xs">Sesuaikan nilai barang untuk estimasi nominal pajak RI.</p>
                                </div>
                                
                                <div className="flex flex-col gap-3 w-full md:w-auto">
                                  <div className="flex bg-white/10 p-1 rounded-lg border border-white/20">
                                    <button 
                                      onClick={() => setCalcCurrency('IDR')}
                                      className={`flex-1 px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${calcCurrency === 'IDR' ? 'bg-white text-primary-brand shadow-sm' : 'text-white/60 hover:text-white'}`}
                                    >
                                      IDR
                                    </button>
                                    <button 
                                      onClick={() => setCalcCurrency('USD')}
                                      className={`flex-1 px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${calcCurrency === 'USD' ? 'bg-white text-primary-brand shadow-sm' : 'text-white/60 hover:text-white'}`}
                                    >
                                      USD
                                    </button>
                                  </div>

                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs font-bold">
                                      {calcCurrency === 'IDR' ? 'Rp' : 'USD'}
                                    </span>
                                    <Input 
                                      type="number" 
                                      value={calcCurrency === 'IDR' ? customValueIdr : customValueUsd} 
                                      onChange={(e) => {
                                          const val = e.target.value;
                                          const num = parseFloat(val);
                                          const fieldSet = calcCurrency === 'IDR' ? setCustomValueIdr : setCustomValueUsd;
                                          
                                          if (val === "") {
                                            fieldSet(0);
                                            setCustomValueError("Nilai barang tidak boleh kosong");
                                          } else if (isNaN(num)) {
                                            setCustomValueError("Masukkan angka yang valid");
                                          } else if (num < 0) {
                                            fieldSet(num);
                                            setCustomValueError("Nilai barang tidak boleh negatif");
                                          } else if (num === 0) {
                                            fieldSet(0);
                                            setCustomValueError("Nilai barang harus lebih besar dari 0");
                                          } else {
                                            fieldSet(num);
                                            setCustomValueError(null);
                                          }

                                          if (calcCurrency === 'IDR') {
                                            setCustomValueUsd(num / 16000);
                                          } else {
                                            setCustomValueIdr(num * 16000);
                                          }
                                      }}
                                      className="bg-white/10 border-white/20 text-white font-bold h-10 pl-11 focus-visible:ring-white/30 rounded-xl w-full md:w-48"
                                    />
                                    {customValueError && <p className="absolute -bottom-5 left-0 text-[9px] text-red-200 truncate w-full">{customValueError}</p>}
                                  </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border-brand overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-bg-app text-text-muted">
                                      <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest">Komponen</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest">Tarif</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest">Estimasi (IDR)</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border-brand">
                                      {(() => {
                                        const valUsd = calcCurrency === 'IDR' ? customValueIdr / 16000 : customValueUsd;
                                        const valIdr = valUsd * 16000;

                                        const parseRate = (rateStr?: string) => {
                                          if (!rateStr) return 0;
                                          const match = rateStr.match(/[\d.]+/);
                                          return match ? parseFloat(match[0]) / 100 : 0;
                                        };

                                        const beaMasukRate = parseRate(result.import_duty);
                                        const ppnRate = parseRate(result.vat) || 0.11;
                                        const ppnbmRate = parseRate(result.ppnhb);
                                        const pphRate = 0.075;

                                        const beaMasukAmt = valIdr * beaMasukRate;
                                        const nilaiImpor = valIdr + beaMasukAmt;
                                        const ppnAmt = nilaiImpor * ppnRate;
                                        const pphAmt = nilaiImpor * pphRate;
                                        const ppnbmAmt = nilaiImpor * ppnbmRate;
                                        const totalPajakAmt = beaMasukAmt + ppnAmt + pphAmt + ppnbmAmt;

                                        return (
                                          <>
                                            {[
                                              { label: "Bea Masuk", rate: result.import_duty || "0%", amt: beaMasukAmt },
                                              { label: "PPN", rate: result.vat || "11%", amt: ppnAmt },
                                              { label: "PPh Pasal 22", rate: "7.5%", amt: pphAmt },
                                              { label: "PPnBM", rate: result.ppnhb || "0%", amt: ppnbmAmt }
                                            ].map((row, i) => (
                                              <tr key={i} className="hover:bg-bg-app/50 transition-colors">
                                                  <td className="px-6 py-4 font-semibold text-text-secondary">{row.label}</td>
                                                  <td className="px-6 py-4 text-center text-text-muted">{row.rate}</td>
                                                  <td className="px-6 py-4 text-right font-bold text-text-main">
                                                    {Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(row.amt)}
                                                  </td>
                                              </tr>
                                            ))}
                                            <tr className="bg-primary-light/30">
                                                <td colSpan={2} className="px-6 py-5 font-bold text-primary-brand text-right uppercase tracking-widest">Total Estimasi Pajak</td>
                                                <td className="px-6 py-5 text-right text-lg font-black text-primary-brand">
                                                  {Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(totalPajakAmt)}
                                                </td>
                                            </tr>
                                          </>
                                        );
                                      })()}
                                  </tbody>
                                </table>
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed max-w-lg italic px-2">
                                * Simulasi menggunakan kurs asumsi Rp 16.000/USD. Harap periksa nilai tukar resmi di kurs.beacukai.go.id sebelum proses impor.
                            </p>
                          </div>
                          {!isPro && <BlurredOverlay featureName="Simulasi Biaya Impor" />}
                        </div>
                      )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Card Footer: Actions */}
          <div className="px-8 py-6 bg-bg-app/50 border-t border-border-brand flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-text-secondary">Apakah hasil ini akurat?</span>
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-full bg-white border border-border-brand flex items-center justify-center text-text-muted hover:text-primary-brand hover:border-primary-brand transition-all hover:bg-primary-light">
                      <ThumbsUp size={16} />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white border border-border-brand flex items-center justify-center text-text-muted hover:text-red-600 hover:border-red-200 transition-all hover:bg-red-50">
                      <ThumbsDown size={16} />
                  </button>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                {!isSavedMode && onSave && (
                  <Button 
                    variant="outline" 
                    onClick={onSave}
                    disabled={saving}
                    className="flex-1 md:flex-none h-11 px-6 rounded-xl border-border-brand text-text-secondary hover:bg-primary-light hover:text-primary-brand transition-all gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={16} />}
                    <span>{saving ? '...' : 'Simpan'}</span>
                  </Button>
                )}
                
                {onExport && (
                  <div className="relative group/btn flex-1 md:flex-none">
                    <Button 
                      variant="outline" 
                      onClick={isPro ? onExport : undefined}
                      disabled={exporting}
                      className={`w-full md:w-auto h-11 px-6 rounded-xl border-border-brand text-text-secondary transition-all gap-2 ${!isPro ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-primary-light hover:text-primary-brand'}`}
                    >
                       {exporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                       <span>PDF {!isPro && <Lock size={10} className="inline ml-1" />}</span>
                    </Button>
                    {!isPro && (
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] py-1 px-2 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          Fitur Pro: Export PDF
                       </div>
                    )}
                  </div>
                )}
                
                {!isSavedMode && onConfirm && (
                  <Button 
                    onClick={onConfirm}
                    disabled={confirming}
                    className="flex-[2] md:flex-none h-11 px-8 rounded-xl bg-accent-success hover:bg-emerald-700 text-white font-bold shadow-sm shadow-accent-success/20 gap-2"
                  >
                    {confirming ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={18} />}
                    <span>Tepat ✓</span>
                  </Button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Insights Side Panel */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-border-brand rounded-3xl overflow-hidden shadow-sm relative">
          <div className="bg-text-main p-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-brand flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-widest">AI Market Analysis</span>
          </div>
          <div className={`p-6 space-y-6 transition-all duration-500 ${!isPro ? 'blur-md grayscale select-none pointer-events-none' : ''}`}>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-text-main">Wawasan Perdagangan</h4>
                <div className="space-y-3">
                    {result.trade_insights.map((insight, i) => (
                      <div key={i} className="flex gap-3 text-sm text-text-secondary leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-brand flex-shrink-0"></div>
                        <span>{insight}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="p-4 bg-bg-app rounded-2xl border border-border-brand space-y-3">
                <div className="flex items-center gap-2 text-primary-brand">
                    <Lightbulb size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest leading-none">Pro Tip {tradeMode === 'import' ? 'Impor' : 'Ekspor'}</span>
                </div>
                <p className="text-xs text-text-main leading-relaxed font-medium">
                  {tradeMode === 'import' 
                    ? "Pastikan Anda memiliki API (Angka Pengenal Importir) yang masih berlaku untuk produk kategori ini guna menghindari hambatan di pelabuhan."
                    : "Pastikan produk memiliki SKU yang jelas dan sertifikat asal (COO) untuk memanfaatkan tarif preferensial di negara tujuan."}
                </p>
              </div>
          </div>
          {!isPro && <BlurredOverlay featureName="Wawasan AI Mendalam" />}
        </Card>

        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="w-full h-14 rounded-2xl border border-dashed border-border-brand text-text-muted hover:text-primary-brand hover:bg-primary-light/50 font-bold gap-2"
          >
            <ArrowLeft size={18} />
            Lakukan Pencarian Baru
          </Button>
        )}
      </div>
    </div>
  );
}

const Loader2 = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
