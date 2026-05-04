import { supabase } from "../lib/supabase";

// Simple fetch helper with retries for transient AI provider errors (429/503/high-demand)
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000) {
  let lastError: any = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;

      // Try to extract a message from JSON or text
      let body: any = null;
      try { body = await res.clone().json(); } catch (e) { /* ignore */ }
      const textBody = typeof body === 'string' ? body : (body && (body.message || body.error)) || await res.clone().text().catch(()=>'');

      // If retryable (rate limit, quota, service unavailable, or known high-demand message), retry
      const isRetryable = res.status === 429 || res.status === 503 || /rate limit|quota|high demand|exhausted/i.test(String(textBody));
      if (isRetryable && attempt < retries - 1) {
        await new Promise(r => setTimeout(r, backoff * Math.pow(2, attempt)));
        continue;
      }

      // Not retrying further — return the response to let caller handle the error body
      return res;
    } catch (err: any) {
      lastError = err;
      if (err && err.name === 'AbortError') throw err;
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, backoff * Math.pow(2, attempt)));
        continue;
      }
    }
  }
  throw lastError;
}

export const openrouterService = {
  /**
   * Helper to get auth header for proxy requests
   */
  async getHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: any = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
  },

  /**
   * AI Smart Search for HS Codes using RAG with OpenRouter
   */
  async smartSearch(
    query: string, 
    abortSignal?: AbortSignal, 
    followUpAnswers?: string[], 
    country?: string, 
    mode: 'import' | 'export' = 'import',
    onProgress?: (message: string) => void
  ) {
    onProgress?.("Menghasilkan embedding untuk pencarian...");
    let contextData: any[] = [];
    let historicalFeedback: any[] = [];
    let queryEmbedding: number[] | null = null;
    
    try {
      const headers = await this.getHeaders();
      
      onProgress?.("Mengambil data referensi dari database...");
      
      const response = await fetch('/api/search/context', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }), // No embedding needed, rely on fast text search
        signal: abortSignal
      });

      if (response.ok) {
        const data = await response.json();
        contextData = data.contextData || [];
        historicalFeedback = data.historicalFeedback || [];
      }
    } catch (e: any) {
      if (e.name === 'AbortError') throw e;
      console.error("Context fetch error:", e);
    }

    try {
      onProgress?.("Menganalisis data dengan AI...");
      
      const btkiContext = contextData.length > 0 
        ? "Database Candidates (BTKI 2022):\n" + contextData.map((d: any) => `[HS ${d.HS_Code}]: ${d.Uraian_Barang} | Bea Masuk: ${d.Bea_Masuk_Import_Duty || '0%'}, PPN: ${d.PPN_VAT || '0%'}, PPnBM: ${d.PPnBM_Luxury_Tax || '0%'}, Bea Keluar: ${d.Bea_Keluar_Export_Duty || '0%'}`).join("\n")
        : "Tidak ditemukan kecocokan langsung di database BTKI.";

      const feedbackContext = historicalFeedback.length > 0
        ? `Historical Feedback (Confirmed by other users): ${JSON.stringify(historicalFeedback)}`
        : "";

      const followUpContext = followUpAnswers && followUpAnswers.length > 0
        ? `User provided additional info to questions: ${JSON.stringify(followUpAnswers)}`
        : "";

      const prompt = `
        You are TARIVA AI, an Indonesian Customs Expert specially assisting UMKM (MSMEs), new exporters, and procurement staff.
        Classify this product for Indonesian Customs: "${query}".
        MODE: ${mode.toUpperCase()}, COUNTRY: ${country || 'International'}
        
        TONE & AUDIENCE:
        - Target Audience: UMKM owners (not customs experts). Be clear, helpful, and educational.
        - Tone: Professional but encouraging. Avoid gatekeeping jargon without explaining it.
        
        STRICT LANGUAGE RULE: All outputs (explanation, questions, text, descriptions, trade insights, market trends, and plain_explanation) MUST be written in BAHASA INDONESIA.
        
        LOGIC & GRI:
        1. Apply General Rules of Interpretation (GRI/KUMHS) 1-6.
        2. CRITICAL: Check the "BTKI CONTEXT" below first. You MUST prioritize and use the provided Database Candidates if they match the product.
        3. VERY IMPORTANT: You MUST copy EXACTLY the HS Code, Bea Masuk (import_duty), PPN (vat), PPnBM (ppnhb), and Bea Keluar (export_tariff) from the BTKI CONTEXT into your JSON output. DO NOT hallucinate or guess tariffs.
        4. If ambiguous or if you cannot pinpoint the exact 8-digit HS Code, YOU MUST ask clarifying questions (limit to 3).
        5. TOKEN LIMIT WARNING: Keep your explanations very short and concise. Ensure your JSON output is completely closed and not truncated.
        4. Use current knowledge to verify Lartas (prohibitions/restrictions) from Indonesian Customs.
        
        CONFIDENCE & CLARIFICATION RULES (CRITICAL):
        - Your primary goal is to find the exact 8-digit HS Code from BTKI 2022.
        - If the product description is vague (e.g., "coffee", "shirt", "iron") or has multiple possibilities:
          1. Set "confidence" to less than 75.
          2. You MUST provide 1-3 clarifying questions in the "questions" array.
          3. Each question MUST have "text" and "options" (2-5 choices).
          4. ALL question content MUST be in BAHASA INDONESIA.
        - If the description is specific enough for a precise 8-digit HS Code, "questions" should be [].
        - DO NOT guess a specific 8-digit code if the user's input is ambiguous. Ask questions first.
        
        BTKI CONTEXT: ${btkiContext}
        FEEDBACK: ${feedbackContext}
        USER INFO: ${followUpContext}
        
        WARNING: You MUST return ONLY a raw JSON object matching the schema below. Do NOT wrap it in markdown block quotes (\`\`\`). Do NOT output any conversational text.
        
        OUTPUT SCHEMA (JSON):
        {
          "explanation": "string",
          "confidence": number,
          "questions": [{"text": "string", "options": ["string"]}],
          "results": [{
            "hscode": "string",
            "description": "string",
            "import_duty": "string",
            "export_tariff": "string",
            "total_tariff": "string",
            "vat": "string",
            "ppnhb": "string",
            "regulations": ["string"],
            "country_regulations": ["string"],
            "trade_insights": ["string"],
            "plain_explanation": "string",
            "market_trends": {"demand": "string", "projections": "string", "price_fluctuation": "string"},
            "docs": {"basic": ["string"], "specific": ["string"]}
          }]
        }
      `;

      onProgress?.("Mengkalkulasi tarif & menganalisis regulasi...");

      const headers = await this.getHeaders();
      const aiResponse = await fetchWithRetry('/api/ai/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt }),
        signal: abortSignal
      }, 3, 1000);

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        if (aiResponse.status === 429) {
          throw new Error("RATE_LIMIT");
        }
        const errorMsg = errorData.message || errorData.error?.message || JSON.stringify(errorData);
        throw new Error(errorMsg);
      }

      const { text } = await aiResponse.json();
      
      console.log("[DEBUG] Raw AI Text:", text);
      let parsed = null;
      
      // 1. Try markdown blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        try { parsed = JSON.parse(codeBlockMatch[1]); } catch(e) {}
      }
      
      // 2. Try naive greedy regex
      if (!parsed) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { parsed = JSON.parse(jsonMatch[0]); } catch(e) {}
        }
      }
      
      // 3. Try parsing text directly
      if (!parsed) {
        try { parsed = JSON.parse(text.trim()); } catch(e) {}
      }
      
      // 4. Robust manual extraction
      if (!parsed) {
         let start = text.indexOf('{');
         while (start !== -1 && !parsed) {
            let brackets = 1;
            let end = start + 1;
            let inString = false;
            let escape = false;
            while (end < text.length && brackets > 0) {
               const char = text[end];
               if (inString) {
                  if (escape) escape = false;
                  else if (char === '\\') escape = true;
                  else if (char === '"') inString = false;
               } else {
                  if (char === '"') inString = true;
                  else if (char === '{') brackets++;
                  else if (char === '}') brackets--;
               }
               end++;
            }
            if (brackets === 0) {
               try { parsed = JSON.parse(text.substring(start, end)); } catch(e) {}
            }
            start = text.indexOf('{', start + 1);
         }
      }

      if (!parsed) {
        throw new Error("PARSE_ERROR");
      }
      
      console.log("[DEBUG] Parsed AI Object:", parsed);
      return parsed;

    } catch (error: any) {
      if (error.message === "CANCELLED" || error.name === "AbortError") {
        return { error: "CANCELLED", explanation: "Permintaan dibatalkan oleh pengguna.", results: [] };
      }
      
      if (error.message === "RATE_LIMIT") {
        return { 
          explanation: "Sistem AI sedang sangat sibuk (Rate Limit). Mohon tunggu sekitar 10-30 detik sebelum mencoba kembali.", 
          results: [],
          error: "RATE_LIMIT"
        };
      }

      console.error("OpenRouter Search Error:", error);
      return { 
        explanation: error.message === "PARSE_ERROR" 
          ? "AI menghasilkan format yang tidak dapat dibaca. Mohon coba ulangi dengan kata kunci lain." 
          : "Gagal menghubungkan ke AI atau format respon tidak valid.", 
        results: [],
        error: "GENERAL_ERROR" 
      };
    }
  },

  /**
   * Save confirmed classification as historical feedback
   */
  async saveFeedback(query: string, hscode: string, description: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({ query, hscode, description })
      });
      
      if (!response.ok) throw new Error(await response.text());
      return { success: true };
    } catch (e) {
      console.error("Save feedback error:", e);
      return { success: false, error: String(e) };
    }
  }
};

