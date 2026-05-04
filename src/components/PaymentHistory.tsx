import React from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../lib/store';
import { User } from '@supabase/supabase-js';
import { 
  ChevronLeft, 
  CreditCard, 
  Calendar, 
  Hash, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  invoice_number: string;
  created_at: string;
  amount: number;
  status: string;
  plan_name: string;
  payment_channel?: string;
}

export function PaymentHistory({ onBack }: { onBack: () => void }) {
  const { user } = useAppStore();
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      } catch (err: any) {
        console.error('Error fetching payment history:', err);
        toast.error('Gagal memuat riwayat pembayaran');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'capture':
      case 'settlement':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-accent-success rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
            <CheckCircle2 size={12} />
            Berhasil
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
            <Clock size={12} />
            Menunggu
          </div>
        );
      case 'failed':
      case 'expire':
      case 'cancel':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
            <AlertCircle size={12} />
            Gagal
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-100">
            {status}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary-brand" size={32} />
        <p className="text-text-secondary font-medium">Memuat riwayat transaksi...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary-brand hover:text-primary-dark font-bold text-sm mb-2 group"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Kembali
          </button>
          <h2 className="text-3xl font-black tracking-tight text-text-main flex items-center gap-3">
            <CreditCard className="text-primary-brand" size={32} />
            Riwayat Transaksi
          </h2>
          <p className="text-text-secondary font-medium">Lacak semua pembayaran dan status langganan Pro Anda.</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-border-brand rounded-3xl p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-bg-app rounded-full flex items-center justify-center mx-auto text-text-muted">
            <Hash size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-text-main">Belum ada transaksi</h3>
            <p className="text-text-secondary max-w-sm mx-auto">
              Anda belum memiliki riwayat pembayaran. Upgrade ke paket Pro untuk mendapatkan fitur lengkap.
            </p>
          </div>
          <Button 
            onClick={() => {
              const event = new CustomEvent('navigate-pricing');
              window.dispatchEvent(event);
            }}
            className="bg-primary-brand text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary-brand/20"
          >
            Upgrade ke Pro
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-border-brand overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border-brand">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-text-muted">Invoice & Tanggal</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-text-muted">Paket</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-text-muted">Jumlah</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-text-muted">Status</th>
                  <th className="px-6 py-5 text-right text-xs font-black uppercase tracking-widest text-text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-brand/50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-6 font-medium">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-text-main font-bold">
                          <Hash size={14} className="text-slate-400" />
                          {payment.invoice_number}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-text-secondary font-bold">
                          <Calendar size={12} />
                          {formatDate(payment.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-text-main">{payment.plan_name}</span>
                        {payment.payment_channel && (
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            via {payment.payment_channel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-black text-text-main">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary-brand hover:text-primary-dark hover:bg-primary-light font-bold text-xs gap-2 rounded-lg"
                        disabled={payment.status !== 'success' && payment.status !== 'settlement'}
                      >
                        <Download size={14} />
                        Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payments.some(p => p.status === 'success' || p.status === 'settlement') && (
        <div className="bg-primary-brand/5 border border-primary-brand/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-brand shadow-sm border border-primary-brand/10">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-text-main">Masalah dengan langganan Anda?</h4>
              <p className="text-xs text-text-secondary font-medium">Jika pembayaran berhasil tapi status belum update, klik tombol sinkronisasi.</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={async () => {
              if (!user) return;
              toast.info('Menyinkronkan status...');
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch('/api/sync-pro', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                  },
                  body: JSON.stringify({})
                });
                const result = await res.json();
                if (result.status === 'upgraded') {
                  toast.success('Status berhasil disinkronkan!');
                  setTimeout(() => window.location.reload(), 1000);
                } else {
                  toast.error('Tidak ada pembayaran baru terdeteksi.');
                }
              } catch (e) {
                toast.error('Gagal menyinkronkan status.');
              }
            }}
            className="border-primary-brand/20 text-primary-brand font-bold whitespace-nowrap hover:bg-primary-brand hover:text-white rounded-xl"
          >
            Sinkronkan Status
          </Button>
        </div>
      )}
    </motion.div>
  );
}
