import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AuthProps {
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function Auth({ onClose, initialMode = 'login' }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Kata sandi wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter';
    }

    if (mode === 'register' && !fullName) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, requirements: { length: false, upper: false, lower: false, number: false, special: false } };
    
    const requirements = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass),
    };

    let score = 0;
    if (requirements.length) score++;
    if (requirements.upper) score++;
    if (requirements.lower) score++;
    if (requirements.number) score++;
    if (requirements.special) score++;
    
    // Normalize score to 4 points system (ignoring lower case as separate if we want 4 bars, or I can use 5 bars)
    // Let's use a 5-point system for better precision
    return { score, requirements };
  };

  const { score: strength, requirements } = getPasswordStrength(password);
  const strengthText = ['Sedemikian', 'Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][strength];
  const strengthColor = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-accent-success', 'bg-primary-brand'][strength];

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 transition-all duration-300">
      <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-accent-success scale-125' : 'bg-slate-300'}`} />
      <span className={`text-[10px] font-medium tracking-tight ${met ? 'text-accent-success' : 'text-slate-400'}`}>
        {text}
      </span>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast.success('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Berhasil masuk!');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100"
    >
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-brand/30">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {mode === 'login' ? 'Selamat Datang Kembali' : 'Mulai Perjalanan Anda'}
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          {mode === 'login' 
            ? 'Masuk untuk akses fitur lengkap Tariva' 
            : 'Daftar sekarang untuk kemudahan mencari HS Code'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="text"
                  placeholder="Budi Santoso"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                  }}
                  className={`pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-500 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1">
                  <AlertCircle size={10} />
                  {errors.fullName}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-500 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1">
              <AlertCircle size={10} />
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kata Sandi</label>
            {mode === 'login' && (
              <button 
                type="button"
                className="text-[10px] font-bold text-primary-brand hover:underline"
              >
                Lupa sandi?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              className={`pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-500 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1">
              <AlertCircle size={10} />
              {errors.password}
            </p>
          )}
          {mode === 'register' && password && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2 px-1 space-y-3"
            >
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                <span className="text-slate-400">Kekuatan Sandi</span>
                <span className={strength <= 2 ? 'text-red-500' : strength <= 4 ? 'text-amber-500' : 'text-primary-brand'}>
                  {strengthText}
                </span>
              </div>
              
              <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-500 ${i <= strength ? strengthColor : 'bg-slate-100'}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                <RequirementItem met={requirements.length} text="Min. 8 karakter" />
                <RequirementItem met={requirements.upper} text="Huruf besar" />
                <RequirementItem met={requirements.lower} text="Huruf kecil" />
                <RequirementItem met={requirements.number} text="Angka" />
                <RequirementItem met={requirements.special} text="Karakter spesial" />
              </div>
            </motion.div>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 bg-primary-brand hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary-brand/20 transition-all active:scale-95 mt-4"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm">
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrors({});
            }}
            className="ml-2 font-black text-primary-brand hover:underline"
          >
            {mode === 'login' ? 'Daftar Gratis' : 'Masuk di sini'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
