-- 🧠 VECTOR SEARCH SETUP FOR TARIVA RAG
-- Run this in your Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to BTKI table
-- Adjust the dimension (768 for gemini-embedding-2-preview usually, but check latest docs if it's 1536 or 768)
-- text-embedding-004 is 768. gemini-embedding-2-preview is likely 768 as well.
ALTER TABLE public."BTKI" 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create a function for similarity search
DROP FUNCTION IF EXISTS match_btki;
CREATE OR REPLACE FUNCTION match_btki (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  "HS_Code" text,
  "Uraian_Barang" text,
  "Description_of_Goods" text,
  "Bea_Masuk_Import_Duty" text,
  "PPN_VAT" text,
  "PPnBM_Luxury_Tax" text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b."HS_Code",
    b."Uraian_Barang",
    b."Description_of_Goods",
    b."Bea_Masuk_Import_Duty",
    b."PPN_VAT",
    b."PPnBM_Luxury_Tax",
    1 - (b.embedding <=> query_embedding) AS similarity
  FROM public."BTKI" b
  WHERE 1 - (b.embedding <=> query_embedding) > match_threshold
  ORDER BY b.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Create an index for faster search (IVFFlat or HNSW)
-- Note: You should build this index AFTER populating the embeddings
-- CREATE INDEX ON public."BTKI" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
