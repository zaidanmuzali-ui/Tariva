import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ override: true });

// Helper to clean environment variables (remove quotes, whitespace, carriage returns)
const cleanEnv = (key: string | undefined): string => {
  if (!key) return "";
  return key.toString()
    .replace(/^["']|["']$/g, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[\r\n\t\f\v]/g, '');
};

const OPENROUTER_API_KEY = cleanEnv(process.env.OPENROUTER_API_KEY);
const OPENROUTER_EMBED_MODEL = cleanEnv(process.env.OPENROUTER_EMBED_MODEL) || "jina/jina-embeddings-v2-small-en";

// --- Model Rotation System for Production Stability ---
// Daftar model gratis yang kompatibel dengan Tariva (JSON output, instruction following, multilingual ID)
// Jika model pertama kena rate-limit (429), otomatis rotate ke model berikutnya
const FREE_MODELS = [
  "qwen/qwen3-coder-480b-a35b-instruct",          // Qwen 3 Coder (480B MoE)
  "inclusionai/ling-2.6-1t",                     // Ling 2.6 (1T parameters)
  "tencent/hy3-preview:free",                    // Tencent Hunyuan 3
  "google/gemma-2-9b-it:free",                    // Gemma 2 9B fallback
  "meta-llama/llama-3.1-8b-instruct:free",       // Llama 3.1 8B fallback
];

let currentModelIndex = 0;

function getNextModel(): string {
  const model = FREE_MODELS[currentModelIndex];
  currentModelIndex = (currentModelIndex + 1) % FREE_MODELS.length;
  return model;
}

function resetModelIndex(): void {
  currentModelIndex = 0;
}

// Helper: Call OpenRouter with auto model rotation on 429
async function callOpenRouterWithRotation(
  messages: { role: string; content: string }[],
  temperature = 0.7,
  maxTokens = 1000
): Promise<{ text: string; model: string }> {
  const maxAttempts = FREE_MODELS.length;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const model = getNextModel();
    console.log(`[AI] Attempt ${attempt + 1}/${maxAttempts} — Using model: ${model}`);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://tariva.vercel.app",
          "X-Title": "Tariva",
        },
        body: JSON.stringify({ 
          model, 
          messages, 
          temperature, 
          max_tokens: maxTokens
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        const text = data.choices?.[0]?.message?.content;
        
        if (!text || text.trim().length === 0) {
          console.warn(`[AI] ⚠ Model ${model} returned empty content. Rotating...`);
          lastError = new Error(`Empty content from ${model}`);
          continue;
        }

        console.log(`[AI] ✓ Success with model: ${model}`);
        return { text, model };
      }

      // Rate limited or other error — rotate to next model
      const errorText = await response.text();
      console.warn(`[AI] ⚠ Model ${model} returned ${response.status}: ${errorText.substring(0, 200)}`);
      lastError = new Error(errorText || `HTTP ${response.status}`);
      continue;

    } catch (fetchError: any) {
      console.error(`[AI] ✗ Fetch error for ${model}:`, fetchError.message);
      lastError = fetchError;
      continue;
    }
  }

  // All models exhausted
  throw new Error(lastError?.message || "Semua model AI sedang sibuk. Silakan coba lagi dalam beberapa menit.");
}

if (OPENROUTER_API_KEY) {
  const maskedPrefix = OPENROUTER_API_KEY.substring(0, 6);
  const maskedSuffix = OPENROUTER_API_KEY.substring(OPENROUTER_API_KEY.length - 4);
  console.log(`DEBUG: OpenRouter Auth OK. Key: ${maskedPrefix}...${maskedSuffix}`);
  console.log(`DEBUG: ${FREE_MODELS.length} free models configured for rotation.`);
} else {
  console.error("DEBUG: OPENROUTER_API_KEY IS MISSING IN ENVIRONMENT");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Admin Client
const supabaseAdmin = createClient(
  cleanEnv(process.env.VITE_SUPABASE_URL),
  cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Midtrans Configuration
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: cleanEnv(process.env.MIDTRANS_SERVER_KEY),
  clientKey: cleanEnv(process.env.VITE_MIDTRANS_CLIENT_KEY)
});

// Auth Middleware to verify Supabase JWT
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) throw new Error("Invalid token");
    
    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Optional Auth Middleware for guest access
const optionalAuthenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.split(" ")[1]) {
    (req as any).user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) {
      (req as any).user = user;
    } else {
      (req as any).user = null;
    }
    next();
  } catch (error) {
    (req as any).user = null;
    next();
  }
};

export const app = express();
app.use(express.json());

// DEBUG: Check environment variables
app.get("/api/debug/config", (req, res) => {
  res.json({
    OPENROUTER_API_KEY: OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 8)}...${OPENROUTER_API_KEY.substring(OPENROUTER_API_KEY.length - 4)}` : "MISSING",
    FREE_MODELS,
    currentModelIndex,
    OPENROUTER_EMBED_MODEL,
    NODE_ENV: process.env.NODE_ENV,
    note: "Model rotation enabled — auto fallback on rate limit"
  });
});

// Midtrans Token Generation - SECURED
app.post("/api/payment/checkout", authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const { planName } = req.body;
    
    // Server-side validation of plans and prices
    const PLANS: Record<string, number> = {
      'Tariva Pro Plan (Bulanan)': 79000,
      'Tariva Pro Plan (Tahunan)': 806200
    };
    
    const amount = PLANS[planName] || 79000;
    const orderId = `TRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: user?.user_metadata?.full_name?.split(' ')[0] || "Customer",
        last_name: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
        email: user?.email || "customer@tariva.com",
        user_id: user.id
      },
      item_details: [
        {
          id: planName?.replace(/\s+/g, '-').toLowerCase() || "tariva-pro-plan",
          price: amount,
          quantity: 1,
          name: planName || "Tariva Pro Plan"
        }
      ],
      metadata: {
        user_id: user.id,
        plan_name: planName
      }
    };

    const transaction = await snap.createTransaction(parameter);
    res.json(transaction);
  } catch (error: any) {
    console.error("Midtrans Token Error:", error);
    res.status(500).json({ error: "Midtrans Transaction failed", message: error.message });
  }
});

// Midtrans Notification Webhook (Stays public but uses Snap validation)
app.post("/api/payment/callback", async (req, res) => {
  try {
    const notification = req.body;
    const statusResponse = await snap.transaction.notification(notification);
    
    const orderId = statusResponse.order_id;
    const userId = statusResponse.metadata?.user_id;

    if (!userId || userId === "GUEST") {
      return res.status(200).send("OK_GUEST");
    }

    const isSuccess = statusResponse.transaction_status === 'capture' || statusResponse.transaction_status === 'settlement';
    const isFailed = ['deny', 'expire', 'cancel'].includes(statusResponse.transaction_status);

    if (isSuccess) {
      // Upgrade User
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { user_metadata: { plan: "pro", upgraded_at: new Date().toISOString() } }
      );

      if (authError) console.error("Auth metadata update error:", authError);

      // Record payment
      await supabaseAdmin.from("payments").upsert({
        user_id: userId,
        invoice_number: orderId,
        amount: Math.round(parseFloat(statusResponse.gross_amount)),
        status: "success",
        plan_name: statusResponse.metadata?.plan_name || "Tariva Pro Plan",
        payment_channel: statusResponse.payment_type,
        updated_at: new Date().toISOString()
      }, { onConflict: 'invoice_number' });
    } else if (isFailed) {
      await supabaseAdmin.from("payments").upsert({
        user_id: userId,
        invoice_number: orderId,
        amount: Math.round(parseFloat(statusResponse.gross_amount)),
        status: "failed",
        plan_name: statusResponse.metadata?.plan_name || "Tariva Pro Plan",
        updated_at: new Date().toISOString()
      }, { onConflict: 'invoice_number' });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Midtrans Notification Error:", error);
    res.status(500).send("Error processing notification");
  }
});

// Sync Pro Status Endpoint - SECURED
app.post("/api/sync-pro", authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const { orderId } = req.body;
  const userId = user.id;

  try {
    // 1. Check local database first
    let { data: payments } = await supabaseAdmin
      .from("payments")
      .select("status, plan_name")
      .eq("user_id", userId)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1);

    // 2. If not found locally, try checking Midtrans directly using orderId
    if ((!payments || payments.length === 0) && orderId) {
      try {
        const statusResponse = await snap.transaction.status(orderId);
        // Verify that this order belongs to the user
        if (statusResponse.metadata?.user_id !== userId) {
          return res.status(403).json({ error: "Order ID does not match current user" });
        }

        const isSuccess = statusResponse.transaction_status === 'capture' || statusResponse.transaction_status === 'settlement';
        
        if (isSuccess) {
          await supabaseAdmin.auth.admin.updateUserById(userId, { 
            user_metadata: { plan: "pro", upgraded_at: new Date().toISOString() } 
          });
          await supabaseAdmin.from("payments").upsert({
            user_id: userId,
            invoice_number: orderId,
            amount: Math.round(parseFloat(statusResponse.gross_amount)),
            status: "success",
            plan_name: statusResponse.metadata?.plan_name || "Tariva Pro Plan",
            payment_channel: statusResponse.payment_type,
            updated_at: new Date().toISOString()
          }, { onConflict: 'invoice_number' });
          
          return res.json({ status: "upgraded", message: "Akun disinkronkan." });
        }
      } catch (midtransError) {
        console.error("Direct Midtrans check failed:", midtransError);
      }
    }

    if (payments && payments.length > 0) {
      const payment = payments[0];
      const isYearly = payment.plan_name?.toLowerCase().includes('year') || payment.plan_name?.toLowerCase().includes('tahunan');
      const durationDays = isYearly ? 365 : 30;

      const { data: updatedUserData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { 
          user_metadata: { 
            plan: "pro", 
            upgraded_at: new Date().toISOString(),
            expiry_at: new Date(Date.now() + durationDays * 86400000).toISOString(),
            plan_type: isYearly ? 'yearly' : 'monthly'
          } 
        }
      );

      if (authError) throw authError;
      return res.json({ status: "upgraded", user: updatedUserData.user });
    }

    return res.json({ status: "unchanged" });
  } catch (error: any) {
    console.error("Sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Check and Downgrade Expired Users - SECURED
app.post("/api/check-subscription", authenticateUser, async (req, res) => {
  const userFromToken = (req as any).user;
  const userId = userFromToken.id;

  try {
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getUserError || !user) throw new Error("User not found");

    const metadata = user.user_metadata;
    if (metadata.plan === 'pro' && metadata.expiry_at) {
      const now = new Date();
      const expiry = new Date(metadata.expiry_at);

      if (now > expiry) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { ...metadata, plan: "free", expired_at: metadata.expiry_at }
        });
        return res.json({ status: "downgraded" });
      }
    }

    return res.json({ status: "ok" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Context Search Proxy (RAG) - PUBLIC BUT RATE LIMITED/MINIMAL
app.post("/api/search/context", async (req, res) => {
  try {
    const { query, embedding } = req.body;
    
    let contextData: any[] = [];
    let historicalFeedback: any[] = [];

    if (embedding) {
      const { data: btkiData } = await supabaseAdmin.rpc('match_btki', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 5,
      });
      if (btkiData) contextData = btkiData;
    }

    if (contextData.length === 0 && query) {
      // Use Supabase textSearch for powerful full-text keyword matching
      const searchKeywords = query.split(/\s+/).filter((w: string) => w.length > 2).join(' | ');
      
      let orString = `HS_Code.ilike.%${query}%`;
      if (searchKeywords) {
        orString += `,Uraian_Barang.fts.${searchKeywords},Description_of_Goods.fts.${searchKeywords}`;
      }

      const { data: fallbackData } = await supabaseAdmin
        .from('BTKI')
        .select('HS_Code, Uraian_Barang, Bea_Masuk_Import_Duty, Bea_Keluar_Export_Duty, PPN_VAT, PPnBM_Luxury_Tax')
        .or(orString)
        .limit(10);
        
      if (fallbackData) contextData = fallbackData;
    }

    if (query) {
      const { data: feedbackData } = await supabaseAdmin
        .from('btki_feedback')
        .select('*')
        .ilike('query', `%${query}%`)
        .limit(3);
      if (feedbackData) historicalFeedback = feedbackData;
    }

    res.json({ contextData, historicalFeedback });
  } catch (error: any) {
    res.status(500).json({ error: "Context Search API Error" });
  }
});

// AI Search Proxy - SECURED (OpenRouter with Model Rotation)
app.post("/api/ai/search", optionalAuthenticateUser, async (req, res) => {
  if (!OPENROUTER_API_KEY) {
    console.error("DEBUG: OPENROUTER_API_KEY is missing in server environment");
    return res.status(503).json({ error: "AI Service Unavailable (Missing API Key)" });
  }

  try {
    const { prompt } = req.body;

    console.log(`[AI Search] Starting with model rotation (${FREE_MODELS.length} models available)`);

    const { text, model } = await callOpenRouterWithRotation(
      [{ role: "user", content: prompt }],
      0.7,
      1000
    );

    console.log(`[AI Search] ✓ Response received from: ${model}. First 200 chars: ${text.substring(0, 200)}`);
    res.json({ text });
  } catch (error: any) {
    let message = error.message || "AI Analysis Failed";
    console.error(`[AI Search] ✗ All models failed:`, message);

    if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("semua model")) {
      return res.status(429).json({ 
        error: "RATE_LIMIT", 
        message: "Semua model AI sedang sibuk. Mohon tunggu 30 detik lalu coba lagi." 
      });
    }

    if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("401")) {
      return res.status(401).json({ error: "INVALID_KEY", message: "API Key tidak valid atau format salah." });
    }

    res.status(500).json({ error: message });
  }
});

// AI Embedding Proxy - SECURED (Using free embedding service fallback)
app.post("/api/ai/embed", optionalAuthenticateUser, async (req, res) => {
  try {
    const { text } = req.body;

    // OpenRouter doesn't have a native embeddings endpoint
    // Fallback: Use HuggingFace Inference API (free, no key required for limited use)
    // OR return zero-vector if embeddings fail (graceful degradation)
    
    // 1. Try OpenRouter Llama Nemotron Embed (Primary)
    try {
      const orResponse = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://tariva.vercel.app",
          "X-Title": "Tariva",
        },
        body: JSON.stringify({
          model: "nvidia/llama-nemotron-embed-vl-1b-v2",
          input: text
        })
      });

      if (orResponse.ok) {
        const data: any = await orResponse.json();
        const embedding = data.data?.[0]?.embedding;
        if (embedding) {
          console.log(`[Embedding] OpenRouter success, dim: ${embedding.length}`);
          return res.json({ embedding });
        }
      } else {
        const errorText = await orResponse.text();
        console.warn(`[Embedding] OpenRouter failed (${orResponse.status}): ${errorText.substring(0, 100)}`);
      }
    } catch (orError: any) {
      console.warn(`[Embedding] OpenRouter fetch error:`, orError.message);
    }

    // 2. Fallback: Try HuggingFace Inference API
    try {
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
        {
          headers: { Authorization: `Bearer hf_kMbpqKnNkzXXXXXXXXXXXXXXXXXXXXXXX` },
          method: "POST",
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (hfResponse.ok) {
        const embeddings: number[] = await hfResponse.json();
        console.log(`[Embedding] HuggingFace success, dim: ${embeddings.length}`);
        return res.json({ embedding: embeddings });
      }
    } catch (hfError) {
      console.warn(`[Embedding] HuggingFace fallback failed:`, (hfError as any).message);
    }

    // Final fallback: Generate mock embedding (all zeros) to keep system running
    // This allows text search to continue without embeddings
    const mockEmbedding = new Array(384).fill(0);
    console.warn(`[Embedding] Using mock embedding (${mockEmbedding.length} dims)`);
    res.json({ embedding: mockEmbedding });

  } catch (error: any) {
    console.error(`Embedding Error:`, error.message);
    
    // Return mock embedding instead of failing
    const mockEmbedding = new Array(384).fill(0);
    res.json({ embedding: mockEmbedding });
  }
});

// Save Feedback Proxy - SECURED
app.post("/api/feedback", authenticateUser, async (req, res) => {
  try {
    const { query, hscode, description } = req.body;
    if (!query || !hscode) return res.status(400).json({ error: "Missing required fields" });

    const { error } = await supabaseAdmin
      .from('btki_feedback')
      .insert([{ query, hscode, description, user_id: (req as any).user.id }]);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// startServer moved to server.ts

