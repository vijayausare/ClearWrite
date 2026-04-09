// background.js - Handles Groq API calls for all rewrite modes

const PROMPTS = {
  grammar: `You are a grammar correction assistant.
Fix all grammar, spelling, and punctuation errors in the user's text.
Rules:
- Return ONLY the corrected text, nothing else
- Preserve the original meaning, tone, and style exactly
- Preserve line breaks and formatting
- If already correct, return it unchanged
- Do not add any preamble like "Here is the corrected text:"`,

  polite: `You are a communication expert who makes text more polite and considerate.
Rewrite the user's text to be warmer, more respectful, and considerate of the reader's feelings.
Rules:
- Return ONLY the rewritten text, nothing else
- Keep the core message and meaning intact
- Use courteous language, soften commands, add please/thank you where natural
- Do not add any preamble or explanation`,

  clear: `You are a clarity expert who makes text easier to understand.
Rewrite the user's text to be clearer, simpler, and easier to understand.
Rules:
- Return ONLY the rewritten text, nothing else
- Break up complex sentences, replace jargon with plain language
- Keep the meaning 100% intact
- Do not add any preamble or explanation`,

  formal: `You are a professional writing expert.
Rewrite the user's text in a formal, professional tone suitable for business or academic contexts.
Rules:
- Return ONLY the rewritten text, nothing else
- Use professional vocabulary, avoid contractions and slang
- Maintain a respectful and objective tone
- Keep the core message intact
- Do not add any preamble or explanation`,

  casual: `You are a friendly writing coach.
Rewrite the user's text in a casual, friendly, conversational tone.
Rules:
- Return ONLY the rewritten text, nothing else
- Use natural everyday language, contractions are fine
- Sound like a real person talking, not a formal document
- Keep the core message intact
- Do not add any preamble or explanation`,

  shorter: `You are an expert editor who specialises in concise writing.
Rewrite the user's text to be significantly shorter while keeping the key message.
Rules:
- Return ONLY the rewritten text, nothing else
- Remove filler words, redundancy, and unnecessary detail
- Keep every important point; do not omit key information
- Do not add any preamble or explanation`,
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "rewriteText") {
    handleRewrite(request.mode, request.text, sendResponse);
    return true;
  }
});

async function handleRewrite(mode, text, sendResponse) {
  try {
    const { groqApiKey } = await chrome.storage.sync.get("groqApiKey");

    if (!groqApiKey) {
      sendResponse({ error: "NO_API_KEY" });
      return;
    }

    const systemPrompt = PROMPTS[mode] || PROMPTS.grammar;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: text }
        ],
        temperature: 0.3,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const err = await response.json();
      sendResponse({ error: err.error?.message || "API error" });
      return;
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content?.trim();

    if (!result) {
      sendResponse({ error: "Empty response from Groq" });
      return;
    }

    sendResponse({ result });

  } catch (err) {
    sendResponse({ error: err.message });
  }
}
