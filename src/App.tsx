import React from 'react';
import { HSCodeSearch } from './components/HSCodeSearch';
import { About } from './components/About';
import { Auth } from './components/Auth';
import { SavedItems } from './components/SavedItems';
import { PaymentHistory } from './components/PaymentHistory';
import { Pricing } from './components/Pricing';
import { LegalDocs } from './components/LegalDocs';
import ContactSales from './components/ContactSales';
import { supabase } from './lib/supabase';
import { useAppStore } from './lib/store';
import { 
  ShieldCheck, 
  Search, 
  BarChart3, 
  Zap, 
  Globe, 
  ChevronRight,
  Menu,
  X,
  Info,
  LogOut,
  User as UserIcon,
  Bookmark,
  CreditCard,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@supabase/supabase-js';

type Page = 'search' | 'about' | 'saved' | 'pricing' | 'contact' | 'legal' | 'payments';

export default function App() {
  const { 
    user, 
    setUser, 
    isAuthReady, 
    setAuthReady, 
    language, 
    setLanguage, 
    theme, 
    toggleTheme 
  } = useAppStore();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<Page>('search');
  const [legalSection, setLegalSection] = React.useState<'privacy' | 'terms' | 'payment'>('privacy');
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  React.useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  React.useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // SYNC SUBSCRIPTION STATUS: Check if user is PRO
        if (currentUser && currentUser.user_metadata?.plan === 'pro') {
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const checkResponse = await fetch('/api/check-subscription', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentSession?.access_token}`
              },
              body: JSON.stringify({})
            });
            const checkResult = await checkResponse.json();
            if (checkResult.status === 'downgraded') {
              const { data: refreshData } = await supabase.auth.refreshSession();
              if (refreshData.session?.user) {
                setUser(refreshData.session.user);
              }
            }
          } catch (e) {
            console.error('Failed to check subscription status:', e);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setAuthReady(true);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setAuthReady(true);
    });

    const handleNavigatePricing = () => setActiveTab('pricing');
    const handleNavigatePricing = () => setActiveTab('pricing');
    const handleOpenAuthModal = (e: any) => {
      const mode = e.detail?.mode || 'login';
      openAuth(mode);
    };
    
    window.addEventListener('navigate-pricing', handleNavigatePricing);
    window.addEventListener('open-auth-modal', handleOpenAuthModal as any);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('navigate-pricing', handleNavigatePricing);
      window.removeEventListener('open-auth-modal', handleOpenAuthModal as any);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNavigateLegal = (section: 'privacy' | 'terms' | 'payment') => {
    setLegalSection(section);
    setActiveTab('legal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary-brand mb-4" size={40} />
        <p className="text-text-secondary font-medium animate-pulse">Memverifikasi sesi...</p>
      </div>
    );
  }

  // Translation helpers (simple example for store usage)
  const t = (idLabel: string, enLabel: string) => language === 'id' ? idLabel : enLabel;

  return (
    <div className={`min-h-screen bg-bg-app text-text-main flex flex-col font-sans selection:bg-primary-brand/10 selection:text-primary-brand transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <Toaster position="top-center" richColors theme={theme} />
      
      {/* Navigation Bar */}
      <nav className="h-16 px-6 md:px-10 border-b border-border-brand bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-50">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => setActiveTab('search')}
        >
          <div className="bg-white dark:bg-white/10 rounded overflow-hidden flex items-center justify-center p-0.5">
            <img src="/LOGO.png" alt="TARIVA" className="h-[28px] w-auto flex-shrink-0 group-hover:scale-105 transition-transform" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-[0.2em] text-[#0D1B2A] dark:text-white uppercase">TARIVA</span>
          </div>
        </div>

        <div className="hidden md:flex items-center h-full">
          <div className="flex items-center space-x-6 h-full mr-8">
            {[
              { id: 'search' as Page, labelId: 'Pencarian HS', labelEn: 'HS Search' },
              { id: 'about' as Page, labelId: 'Tentang', labelEn: 'About' },
              { id: 'pricing' as Page, labelId: 'Harga', labelEn: 'Pricing' },
              { id: 'saved', labelId: 'Koleksi', labelEn: 'Saved', auth: true },
              { id: 'payments', labelId: 'Transaksi', labelEn: 'Billing', auth: true }
            ].map((link) => {
              if (link.auth && !user) return null;
              const active = activeTab === link.id;
              return (
                <button 
                  key={link.id}
                  onClick={() => setActiveTab(link.id as Page)}
                  className={`transition-all h-full px-1 border-b-2 flex items-center gap-2 text-sm font-semibold tracking-tight ${
                    active 
                      ? 'text-primary-brand border-primary-brand' 
                      : 'text-text-secondary dark:text-slate-400 border-transparent hover:text-primary-brand'
                  }`}
                >
                  {link.id === 'saved' && <Bookmark size={14} className={active ? 'text-primary-brand' : 'text-text-muted'} />}
                  {t(link.labelId, link.labelEn)}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Preferences Group */}
            <div className="flex items-center bg-slate-50 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200/60 dark:border-white/10">
              <button 
                onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                className="w-10 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 hover:shadow-sm rounded-lg text-text-muted transition-all gap-1"
                title="Switch Language"
              >
                <span className="text-[10px] uppercase font-black">{language}</span>
              </button>

              <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />

              <button 
                onClick={toggleTheme}
                className="w-10 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 hover:shadow-sm rounded-lg text-text-muted transition-all"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200/80 dark:bg-slate-700/50"></div>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800/50 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="w-7 h-7 bg-primary-brand text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-inner">
                    {user.user_metadata.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] leading-tight font-heavy text-text-main dark:text-white truncate max-w-[100px]">
                      {user.user_metadata.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <div className="flex items-center gap-1">
                      {user.user_metadata.plan === 'pro' ? (
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Zap size={8} fill="currentColor" />
                          <span className="text-[8px] font-black uppercase tracking-widest">PRO</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => supabase.auth.refreshSession()}
                          className="text-[8px] font-bold text-slate-400 hover:text-primary-brand uppercase tracking-wider"
                        >
                          Free
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                className="text-text-secondary dark:text-slate-400 hover:text-text-main h-9 px-4 font-semibold"
                onClick={() => openAuth('login')}
              >
                {t('Masuk', 'Sign In')}
              </Button>
              <Button 
                className="bg-primary-brand text-white hover:bg-primary-dark rounded-lg h-9 px-5 font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                onClick={() => openAuth('register')}
              >
                {t('Mulai Sekarang', 'Get Started')}
              </Button>
            </div>
          )}
        </div>
      </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-text-secondary p-2 hover:bg-bg-app rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-x-hidden">
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-text-main/20 backdrop-blur-sm z-[55] md:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[60] shadow-2xl md:hidden flex flex-col"
              >
                <div className="p-6 border-b border-border-brand flex items-center justify-between">
                  <span className="font-bold text-text-main">Menu</span>
                  <button onClick={() => setIsMenuOpen(false)} className="text-text-muted">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  {[
                    { id: 'search' as Page, label: 'Pencarian Kode HS' },
                    { id: 'about' as Page, label: 'Tentang TARIVA' },
                    { id: 'pricing' as Page, label: 'Paket & Harga' },
                    { id: 'saved', label: 'Koleksi Saya', auth: true },
                    { id: 'payments', label: 'Riwayat Transaksi', auth: true }
                  ].map((link) => {
                    if (link.auth && !user) return null;
                    const active = activeTab === link.id;
                    return (
                      <button 
                        key={link.id}
                        onClick={() => { setActiveTab(link.id as Page); setIsMenuOpen(false); }}
                        className={`block w-full text-left p-3 rounded-lg font-medium transition-colors ${
                          active 
                            ? 'bg-primary-light text-primary-brand' 
                            : 'text-text-secondary hover:bg-bg-app'
                        }`}
                      >
                        {link.label}
                      </button>
                    );
                  })}
                </div>
                <div className="p-6 border-t border-border-brand space-y-3 bg-white">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-bg-app rounded-xl mb-2">
                        <div className="w-10 h-10 bg-primary-brand text-white rounded-full flex items-center justify-center font-bold">
                          {user.user_metadata.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-text-main">{user.user_metadata.full_name || user.email?.split('@')[0]}</span>
                             {user.user_metadata.plan === 'pro' ? (
                               <span className="px-1.5 py-px bg-amber-100 text-amber-600 rounded-[4px] text-[8px] font-black uppercase tracking-wider border border-amber-200 flex items-center gap-1">
                                 <Zap size={8} fill="currentColor" />
                                 PRO
                               </span>
                             ) : (
                               <span className="px-1.5 py-px bg-slate-100 text-slate-500 rounded-[4px] text-[8px] font-black uppercase tracking-wider border border-slate-200">FREE</span>
                             )}
                          </div>
                          <span className="text-xs text-text-muted line-clamp-1">{user.email}</span>
                        </div>
                      </div>

                      {user.user_metadata.plan !== 'pro' && (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-3 mb-2">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                              <Zap size={16} fill="currentColor" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-amber-900">Upgrade ke Pro</p>
                              <p className="text-[10px] text-amber-700 leading-relaxed font-medium">Fitur ekspor unlimited dan wawasan AI mendalam.</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => { setActiveTab('pricing'); setIsMenuOpen(false); }}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 text-xs rounded-lg shadow-sm"
                          >
                            Upgrade Sekarang
                          </Button>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full justify-center rounded-lg text-red-600 border-red-100 hover:bg-red-50 h-11"
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      >
                        Keluar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-center rounded-lg border-border-brand h-11 font-semibold"
                        onClick={() => { openAuth('login'); setIsMenuOpen(false); }}
                      >
                        Masuk
                      </Button>
                      <Button 
                        className="w-full bg-primary-brand text-white rounded-lg h-11 font-semibold"
                        onClick={() => { openAuth('register'); setIsMenuOpen(false); }}
                      >
                        Mulai Sekarang
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAuthModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <div 
                className="absolute inset-0 bg-text-main/40 backdrop-blur-sm" 
                onClick={() => setIsAuthModalOpen(false)}
              />
              <div className="relative z-10 w-full max-w-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -top-12 right-0 text-white hover:bg-white/10"
                  onClick={() => setIsAuthModalOpen(false)}
                >
                  <X size={24} />
                </Button>
                <Auth 
                  onClose={() => setIsAuthModalOpen(false)} 
                  initialMode={authModalMode}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-10 py-6 md:py-10">
          {activeTab === 'search' ? (
            <HSCodeSearch />
          ) : activeTab === 'about' ? (
            <About 
              onBack={() => setActiveTab('search')} 
              onPricing={() => setActiveTab('pricing')} 
            />
          ) : activeTab === 'pricing' ? (
            <Pricing 
              onBack={() => setActiveTab('search')} 
              onContact={() => setActiveTab('contact')}
            />
          ) : activeTab === 'contact' ? (
            <ContactSales onBack={() => setActiveTab('pricing')} />
          ) : activeTab === 'legal' ? (
            <LegalDocs 
              onBack={() => setActiveTab('search')} 
              initialSection={legalSection}
            />
          ) : activeTab === 'payments' ? (
            <PaymentHistory onBack={() => setActiveTab('search')} />
          ) : (
            <SavedItems onBack={() => setActiveTab('search')} />
          )}
        </div>

        <footer className="border-t border-border-brand bg-white/50 py-10 md:py-16">
          <div className="max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white flex items-center justify-center">
                  <img src="/LOGO.png" alt="TARIVA" className="h-[32px] w-auto" />
                </div>
                <span className="text-xl font-bold tracking-[0.2em] text-[#0D1B2A] uppercase">TARIVA</span>
              </div>
              <p className="text-text-secondary text-sm md:text-base max-w-xs font-medium leading-relaxed">
                Asisten ekspor-impor tercerdas di Indonesia. Membantu Anda melakukan navigasi regulasi dan tarif dengan akurat.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-text-main text-xs uppercase tracking-widest">Navigasi</h4>
              <ul className="space-y-3 text-sm text-text-secondary font-semibold">
                <li><button onClick={() => setActiveTab('search')} className="hover:text-primary-brand transition-colors">Cari HS Code</button></li>
                <li><button onClick={() => setActiveTab('pricing')} className="hover:text-primary-brand transition-colors">Paket & Harga</button></li>
                <li><button onClick={() => setActiveTab('payments')} className="hover:text-primary-brand transition-colors">Riwayat Transaksi</button></li>
                <li><button onClick={() => setActiveTab('about')} className="hover:text-primary-brand transition-colors">Tentang Kami</button></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-text-main text-xs uppercase tracking-widest">Informasi Legal</h4>
              <ul className="space-y-3 text-sm text-text-secondary font-semibold">
                <li><button onClick={() => handleNavigateLegal('privacy')} className="hover:text-primary-brand transition-colors">Kebijakan Privasi</button></li>
                <li><button onClick={() => handleNavigateLegal('terms')} className="hover:text-primary-brand transition-colors">Syarat & Ketentuan</button></li>
                <li><button onClick={() => handleNavigateLegal('payment')} className="hover:text-primary-brand transition-colors">Kebijakan Refund</button></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-6 md:px-10 mt-12 pt-8 border-t border-border-brand flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-text-muted">
            <p>© 2026 TARIVA. Seluruh hak cipta dilindungi.</p>
            <div className="flex gap-6">
              <button onClick={() => handleNavigateLegal('privacy')} className="hover:text-text-main">Privacy Policy</button>
              <button onClick={() => handleNavigateLegal('terms')} className="hover:text-text-main">Terms of Service</button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
