-- SQL untuk setup tabel pembayaran di Supabase
-- Jalankan kode ini di SQL Editor Supabase Anda

-- 1. Tabel untuk mencatat transaksi
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, success, failed
    plan_name TEXT,
    payment_method TEXT,
    payment_channel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. Policy agar user hanya bisa melihat data milik mereka sendiri
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- 4. Fungsi untuk otomatis update timestamp updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Catatan:
-- Untuk mengubah paket user menjadi 'pro', backend akan menggunakan 
-- Supabase Service Role Key untuk mengupdate auth.users metadata.

-- 5. Tabel untuk menyimpan hasil HS Code yang disimpan user
CREATE TABLE IF NOT EXISTS public.saved_hs_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hscode TEXT NOT NULL,
    description TEXT NOT NULL,
    country TEXT NOT NULL,
    trade_mode TEXT NOT NULL,
    query TEXT,
    full_data JSONB, -- Menyimpan objek HSResult lengkap
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Aktifkan RLS untuk saved_hs_codes
ALTER TABLE public.saved_hs_codes ENABLE ROW LEVEL SECURITY;

-- 7. Policy untuk saved_hs_codes
CREATE POLICY "Users can manage own saved HS codes" ON public.saved_hs_codes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- 8. Indeks untuk Performa Produksi
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_number);
CREATE INDEX IF NOT EXISTS idx_saved_hs_user_id ON public.saved_hs_codes(user_id);
