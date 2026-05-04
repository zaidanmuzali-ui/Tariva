// Test script untuk debug OpenRouter API calls
import dotenv from "dotenv";

dotenv.config({ override: true });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_SEARCH_MODEL = process.env.OPENROUTER_SEARCH_MODEL || "mistral-7b";

console.log(`
========================================
TEST OPENROUTER API CALLS
========================================
API Key (masked): ${OPENROUTER_API_KEY.substring(0, 8)}...${OPENROUTER_API_KEY.substring(OPENROUTER_API_KEY.length - 4)}
Search Model: ${OPENROUTER_SEARCH_MODEL}
========================================
`);

async function testSearchAPI() {
  console.log("\n[1] Testing Chat Completions Endpoint...");
  
  const payload = {
    model: OPENROUTER_SEARCH_MODEL,
    messages: [{ role: "user", content: "Say hello" }],
    temperature: 0.7,
    max_tokens: 100
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
      },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log("✓ Success!");
      console.log(`Response:`, data.choices?.[0]?.message?.content);
    } else {
      console.log("✗ Error:");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error: any) {
    console.error("✗ Network Error:", error.message);
  }
}

async function testListModels() {
  console.log("\n[2] Testing List Models Endpoint...");
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      }
    });

    console.log(`Status: ${response.status}`);
    const data: any = await response.json();
    
    if (response.ok) {
      console.log(`✓ Success! Found ${data.data?.length} models`);
      console.log("\nFree Chat Models:");
      data.data
        ?.filter((m: any) => m.pricing?.prompt === "0" && m.id.includes("free"))
        ?.slice(0, 5)
        ?.forEach((m: any) => {
          console.log(`  - ${m.id}`);
        });
    } else {
      console.log("✗ Error:");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error: any) {
    console.error("✗ Network Error:", error.message);
  }
}

async function main() {
  if (!OPENROUTER_API_KEY) {
    console.error("❌ OPENROUTER_API_KEY is not set in .env");
    process.exit(1);
  }

  await testListModels();
  await testSearchAPI();

  console.log("\n========================================");
  console.log("If tests fail, check:");
  console.log("1. API Key is correct (starts with sk-or-)");
  console.log("2. Account has active credits on OpenRouter");
  console.log("3. Network connection is working");
  console.log("========================================\n");
}

main();
