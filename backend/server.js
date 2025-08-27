// backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // or axios
const app = express();
app.use(cors());
app.use(bodyParser.json());

const GROQ_BASE = "https://api.groq.com/openai/v1"; // Groq uses OpenAI-compatible endpoints
// Make sure GROQ_API_KEY is set in Render environment variables (see deploy steps)

function stripCodeFence(s) {
  return s.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
}

app.post("/interpret", async (req, res) => {
  try {
    const { question, headers } = req.body;
    // Prompt: ask Groq to return JSON only
    const prompt = `You are a JSON-only assistant. Given dataset headers ${JSON.stringify(headers)} and a user's natural language request, return ONLY JSON with one of:
{"action":"filter","filter":{"column":"COLUMN","op":"contains"|"="|">"|"<","value":"..."}}
or
{"action":"aggregate","aggregate":{"func":"sum"|"avg"|"count","column":"COLUMN","groupBy":"OptionalColumn"}}
Do not include any explanation, only valid JSON. User question: "${question}"`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GROQ_API_KEY" });

    const body = {
      model: "llama3-13b-8192", // choose a model available to your Groq account, or use "llama3-70b-8192" if available
      messages: [
        { role: "system", content: "You are a JSON-only generator." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0,
    };

    const r = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const json = await r.json();
    const text = json?.choices?.[0]?.message?.content ?? "";
    const clean = stripCodeFence(text);
    let instructions;
    try {
      instructions = JSON.parse(clean);
    } catch (err) {
      // If Groq didn't return clean JSON, respond with an error so frontend can fallback
      return res.status(500).json({ error: "Invalid JSON from Groq", raw: clean });
    }

    return res.json({ instructions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
