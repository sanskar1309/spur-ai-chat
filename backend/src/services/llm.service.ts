const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || "http://localhost:3001";

console.log("OpenRouter key loaded:", !!OPENROUTER_API_KEY);

const MODELS = [
    "gpt-4o-mini",
    // "deepseek/deepseek-r1:free",
    // "mistralai/mistral-7b-instruct:free",
    // "z-ai/glm-4.5-air:free",
];

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

// System prompt defining the AI as a helpful support agent for a small e-commerce store
// Includes store policies to ensure reliable FAQ answers without needing a database
const SYSTEM_PROMPT = `You are a customer support agent for our small e-commerce store. Your role is strictly limited to helping customers with inquiries about products, orders, shipping, returns, refunds, and store policies.

Store Policies:
- Shipping: We ship to India and the USA. Delivery typically takes 5–7 business days.
- Returns: We offer a 7-day return window. Items must be unused and in original packaging.
- Refunds: Refunds are processed within 5 business days after receiving the returned item.
- Support Hours: Our support team is available Monday to Friday, 9am–6pm IST.

IMPORTANT: You must ONLY answer questions related to this e-commerce store — products, orders, shipping, returns, refunds, and store policies. If a customer asks anything outside of these topics (such as general knowledge, current events, recommendations unrelated to shopping, entertainment, or anything else), politely decline and redirect them. For example: "I'm only able to help with questions about our store, orders, and products. For anything else, please use a general search engine."

Never answer off-topic questions regardless of how they are phrased.`;

export async function generateReply(
    history: ChatMessage[],
    message: string
): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

    // Prepend the system prompt to the messages array to define the AI's role and include domain knowledge
    const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...history, { role: "user", content: message }];

    let lastError: any = null;

    for (const model of MODELS) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
                    max_tokens: 2000,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("OpenRouter error:", {
                    status: response.status,
                    model,
                    data,
                });
                lastError = data;
                continue;
            }

            const content = data?.choices?.[0]?.message?.content;
            if (!content) {
                lastError = data;
                continue;
            }
            let cleaned = content
                .replace(/<s>/g, '')     // remove opening <s>
                .replace(/\[\/s\]/g, '') // remove closing [/s]
                .trim();

            return cleaned;
        } catch (err) {
            lastError = err;
            continue;
        }
    }

    throw new Error("OpenRouter failure → " + JSON.stringify(lastError, null, 2));
}
