const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_PUBLIC_URL");
const OPENAI_EMBEDDINGS_URL = Deno.env.get("OPENAI_EMBEDDINGS_URL");
const MODEL = Deno.env.get("MODEL");
const EMBEDDING_DIMENSIONS = Deno.env.get("EMBEDDING_DIMENSIONS");
const OPENAI_CHAT_URL = Deno.env.get("OPENAI_CHAT_URL");
const OPENAI_CHAT_MODEL = Deno.env.get("OPENAI_CHAT_MODEL");
// -------------------- HELPERS --------------------
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
}

async function fetchWithTimeout(input: RequestInfo, init: RequestInit, ms: number) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(id);
    }
}

function requireEnv() {
    if (!SUPABASE_URL) throw new Error("SUPABASE_URL env var is missing");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY env var is missing");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY env var is missing");
    if (!OPENAI_EMBEDDINGS_URL) throw new Error("OPENAI_EMBEDDINGS_URL env var is missing");
    if (!MODEL) throw new Error("MODEL env var is missing");
}

type UserRole = "organizer" | "speaker";

type SearchRequestBody = {
    user_id: string; // this is an id (uuid) in your case
    user_prompt: string;
    user_role: UserRole;
    limit?: number;
};

// -------------------- CORE --------------------
async function getProfileRow(userId: string, table: string) {
    // Uses id column
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(userId)}&limit=1`;

    const res = await fetchWithTimeout(
        url,
        {
            method: "GET",
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
        },
        6_000,
    );

    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error fetching ${table} (${res.status}): ${t}`);
    }

    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows[0];
}

function addIfNotEmpty(items, key, value) {
    if (!value) {
        return;
    }

    items.push({[key]: value});
}

function buildEmbeddingText(p: any, userPrompt: string) {
    const textItems = [];

    addIfNotEmpty(textItems, 'country', p.country);
    addIfNotEmpty(textItems, 'city', p.city);
    addIfNotEmpty(textItems, 'industries', p.industries.join(', '));
    addIfNotEmpty(textItems, 'tagline', p.tagline);
    addIfNotEmpty(textItems, 'professional_headline', p.professional_headline);
    addIfNotEmpty(textItems, 'event_types', p.event_types.join(', '));
    addIfNotEmpty(textItems, 'event_sizes', p.event_sizes.join(', '));
    addIfNotEmpty(textItems, 'formats', p.formats.join(', '));
    addIfNotEmpty(textItems, 'locations', p.locations.join(', '));
    addIfNotEmpty(textItems, 'speaker_formats', p.speaker_formats.join(', '));
    addIfNotEmpty(textItems, 'languages', p.languages.join(', '));
    addIfNotEmpty(textItems, 'user_prompt', userPrompt);

    const formattedText = textItems
        .map(obj => {
            const [key, value] = Object.entries(obj)[0];
            return `${key}: ${value}`;
        })
        .join(', ');
    console.log("formattedText: " + formattedText);

    return formattedText;
}

async function createEmbedding(text: string): Promise<number[]> {
    const res = await fetchWithTimeout(
        OPENAI_EMBEDDINGS_URL,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ model: MODEL, input: text }),
        },
        12_000,
    );

    if (!res.ok) {
        const t = await res.text();
        throw new Error(`OpenAI error (${res.status}): ${t}`);
    }

    const data = await res.json();
    const embedding = data?.data?.[0]?.embedding;

    if (!Array.isArray(embedding) || embedding.length < 100) {
        throw new Error("Invalid embedding returned from OpenAI.");
    }

    return embedding as number[];
}

async function callMatchRpc(rpcName: string, embedding: number[], limit: number) {
    const res = await fetchWithTimeout(
        `${SUPABASE_URL}/rest/v1/rpc/${rpcName}`,
        {
            method: "POST",
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query_embedding: embedding, match_count: limit }),
        },
        6_000,
    );

    if (!res.ok) {
        const t = await res.text();
        throw new Error(`RPC ${rpcName} error (${res.status}): ${t}`);
    }

    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
}

async function fetchMatchedProfiles(table: string, ids: string[]) {
    if (ids.length === 0) return [];

    const inList = ids.map((u) => encodeURIComponent(u)).join(",");
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=in.(${inList})`;

    const res = await fetchWithTimeout(
        url,
        {
            method: "GET",
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
        },
        6_000,
    );

    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error fetching matched profiles from ${table} (${res.status}): ${t}`);
    }

    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
}

function extractMatchId(m: any): string | null {
    // Accept common RPC shapes
    const candidate = m?.user_id ?? m?.match_user_id ?? m?.match_id ?? m?.id ?? m?.profile_id ?? null;
    return typeof candidate === "string" ? candidate : null;
}

function extractScore(m: any): number | null {
    const s = m?.similarity ?? m?.score ?? m?.distance ?? null;
    return typeof s === "number" ? s : null;
}

async function searchUserProfiles(userId: string, userPrompt: string, userRole: UserRole, limit = 10) {
    requireEnv();

    const callerTable = userRole === "organizer" ? "organization_profiles" : "speaker_profiles";
    const callerProfile = await getProfileRow(userId, callerTable);
    if (!callerProfile) throw new Error(`User not found for ID: ${userId} in ${callerTable}`);

    const embeddingText = buildEmbeddingText(callerProfile, userPrompt);
    const embedding = await createEmbedding(embeddingText);

    const rpcName = userRole === "organizer" ? "match_speakers" : "match_organizations";
    const matches = await callMatchRpc(rpcName, embedding, limit);

    // Normalize to { id, score }
    const normalized = matches
        .map((m: any) => ({ id: extractMatchId(m), score: extractScore(m) }))
        .filter((m: any) => typeof m.id === "string");

    const matchedIds = normalized.map((m: any) => m.id);

    const matchedTable = userRole === "organizer" ? "speaker_profiles" : "organization_profiles";
    const matchedProfiles = await fetchMatchedProfiles(matchedTable, matchedIds);

    // Preserve ranking order
    const profileById = new Map<string, any>(matchedProfiles.map((p: any) => [String(p?.id), p]));

    const results = normalized.map((m: any) => ({
        id: m.id,
        score: m.score,
        profile: profileById.get(m.id) ?? null,
    }));


    //Query LLM scoring
    const llmResponse = await queryLLMScoring(embeddingText, results);

    //Add LLM fields according to LLM judging
    for(const resultItem of results) {
        const matchedLLMItem = llmResponse.find(it => it.speaker_id === resultItem.id);
        //TODO if not found skip it
        resultItem.llmScore = matchedLLMItem.score;
        resultItem.llmScoreExplanation = matchedLLMItem.score_explanation;
    }

    //Sort and filter according to LLM
    const filteredAndSortedResults = results.filter(it => it.llmScore >= 0.5).sort((a, b) => b.llmScore - a.llmScore);

    return { ok: true, user_id: userId, user_role: userRole, results: filteredAndSortedResults };
}

//START OF LLM SCORING

function buildSpeakerScoringPrompt(organizationRequest, speakersList) {
    const speakersText = speakersList
        .map((s) => `- speaker_id: ${s.id}\n  description: ${s.profile.embedding_text}`)
        .join("\n\n");

    return `
You are an expert matching and scoring system.

Your task is to evaluate how well each speaker matches the organization's request.

INPUT:
1) Organization request (description of organization + requirements for a speaker)
2) List of speakers, each containing:
   - speaker_id
   - speaker description

GOAL:
For EACH speaker, calculate a relevance score from 0 to 1 and provide a short explanation.

SCORING RULES:
- 1.0 = perfect match (topics, expertise, experience, audience, format all align)
- 0.7–0.9 = strong match (most requirements match, minor gaps allowed)
- 0.4–0.6 = partial match (some relevant overlap but not ideal)
- 0.1–0.3 = weak match (little relevance)
- 0.0 = no relevance

Evaluate based on:
- topic similarity
- expertise and domain knowledge
- experience level
- target audience fit
- event format fit (workshop / talk / panel / etc.)
- language or region if mentioned
- any explicit constraints

IMPORTANT:
- Score independently for each speaker
- Be objective and consistent
- Do NOT invent information
- Use only the provided data
- Output MUST be valid JSON
- Output ONLY JSON (no extra text)

OUTPUT FORMAT:
[
  {
    "speaker_id": "SPEAKER_ID",
    "score_explanation": "Short explanation (1–2 sentences)",
    "score": 0.00
  }
]

---

ORGANIZATION REQUEST:
${organizationRequest}

---

SPEAKERS:
${speakersText}
`.trim();
}


async function queryLLMScoring(organizationRequest, speakersList) {
    const prompt = buildSpeakerScoringPrompt(organizationRequest, speakersList);

    console.log("PROMPT: " + prompt);

    // 3) Викликаємо LLM
    const res = await fetch(OPENAI_CHAT_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: OPENAI_CHAT_MODEL,
            temperature: 0,
            messages: [
                { role: "system", content: "Return ONLY valid JSON. No extra text." },
                { role: "user", content: prompt },
            ],
        }),
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(`OpenAI chat error (${res.status}): ${t}`);
    }

    const data = await res.json();
    console.log("data: " + data);

    const content =
        (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
        "";

    if (!content) throw new Error("Empty LLM response");

    console.log("content: " + content);
    // 4) Парсимо JSON
    const rawItems = JSON.parse(content);

    /*
     extractJsonArray(content)
        .map((x) => ({
          speaker_id: String(x && x.speaker_id ? x.speaker_id : ""),
          score_explanation: String(x && x.score_explanation ? x.score_explanation : ""),
          score: clamp01(x && x.score),
        }))
        .filter((x) => x.speaker_id);
    */
    return rawItems;
}



// -------------------- HANDLER --------------------
Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (req.method !== "POST") return jsonResponse({ ok: false, error: "Use POST" }, 405);

    try {
        const body = (await req.json().catch(() => null)) as SearchRequestBody | null;

        const userId = body?.user_id;
        const userPrompt = body?.user_prompt;
        const userRole = body?.user_role;
        const limit = typeof body?.limit === "number" ? body.limit : 10;

        if (!userId || !userPrompt || !userRole) {
            return jsonResponse({ ok: false, error: "Body must include: user_id, user_prompt, user_role" }, 400);
        }
        if (userRole !== "speaker" && userRole !== "organizer") {
            return jsonResponse({ ok: false, error: "user_role must be 'speaker' or 'organizer'" }, 400);
        }

        const result = await searchUserProfiles(userId, userPrompt, userRole, Math.max(1, Math.min(limit, 20)));
        return jsonResponse(result, 200);
    } catch (err) {
        console.error("Error in function:", err);
        return jsonResponse({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, 500);
    }
});
