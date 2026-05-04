// Debug tool to trace full proxy API flow
console.log(`
=====================================
PROXY API DEBUG
=====================================
Tracing: Client → Proxy → External API
=====================================
`);

// Simulate client call to proxy
async function testProxyFlow() {
  console.log("\n[Client] Calling POST /api/ai/search with:");
  const clientPayload = {
    prompt: "Test prompt",
    model: "mistral-7b"
  };
  console.log(JSON.stringify(clientPayload, null, 2));

  console.log("\n[Proxy] Should receive request and forward to OpenRouter");
  console.log("Expected headers:", {
    Authorization: "Bearer sk-or-xxxxxxx",
    "Content-Type": "application/json"
  });

  console.log("\n[Proxy] Response format should be:");
  console.log(JSON.stringify({
    text: "Response from OpenRouter"
  }, null, 2));

  console.log("\n[Client] Error handling issue found:");
  console.log("Current code expects: errorData.message");
  console.log("But server returns: errorData.error (object with .message inside)");

  console.log("\n\n=== ISSUES FOUND ===");
  console.log("1. Error response parsing mismatch");
  console.log("2. Embedding always returns mock data (won't fail)");
  console.log("3. Need to verify actual API key is being sent");
  console.log("4. Check if CORS/headers are blocking request");

  console.log("\n\n=== FIXES NEEDED ===");
  console.log("1. Fix error.message extraction in geminiService.ts");
  console.log("2. Add better logging in server endpoints");
  console.log("3. Verify OpenRouter API key format");
  console.log("4. Test with curl to isolate client vs server issue");
}

testProxyFlow();

console.log(`
=====================================
CURL TEST COMMAND:
=====================================

# Test 1: List models (public, no auth)
curl -s https://openrouter.ai/api/v1/models | jq '.data[0]'

# Test 2: Chat with valid key
curl -X POST https://openrouter.ai/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-or-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "mistral-7b",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }' | jq .

# Test 3: Call proxy from browser console
fetch('/api/ai/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Test message',
    model: 'mistral-7b'
  })
}).then(r => r.json()).then(d => console.log(d))

=====================================
`);
