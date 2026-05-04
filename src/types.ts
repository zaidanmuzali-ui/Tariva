export interface HSResult {
  hscode: string;
  description: string;
  import_duty: string;
  export_tariff: string;
  total_tariff: string;
  vat: string;
  ppnhb: string;
  regulations: string[];
  country_regulations: string[];
  trade_insights: string[];
  market_trends: {
    demand: string;
    projections: string;
    price_fluctuation: string;
  };
  docs?: {
    basic: string[];
    shipping: string[];
    specific: string[];
  };
  plain_explanation?: string;
  fta_benefit?: string | null;
  cost_estimate?: {
    nilai_barang_usd: number;
    bea_masuk_rp: number;
    ppn_rp: number;
    pph_rp: number;
    ppnbm_rp: number;
    total_pajak_rp: number;
    catatan: string;
  } | null;
}
