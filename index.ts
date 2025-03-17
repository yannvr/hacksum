import { serve } from "bun";

const GROK_API_KEY = process.env.GROK_API_KEY;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Validate API key
if (!GROK_API_KEY) {
  console.error("Error: GROK_API_KEY not found in environment variables.");
  console.error("Please set it in your .env file");
  process.exit(1);
}

// Create a Bun.Database for caching
const cache = new Map<string, { data: any; timestamp: number }>();

interface NewsResponse {
  summary: string;
  sentiment: number;
  url: string;
}

async function fetchNewsFromGrok(topic: string): Promise<NewsResponse[]> {
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a test assistant.'
          },
          {
            role: 'user',
            content: `Summarize news in ${topic} market for the last 24 hours`
          }
        ],
        model: 'grok-2-latest',
        stream: false,
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error: ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Split the content into paragraphs and convert each into a news item
    const paragraphs = content.split('\n\n').filter(Boolean);

    return paragraphs.map(paragraph => {
      // Extract the first sentence as summary
      const summary = paragraph.split('.')[0] + '.';

      return {
        summary,
        sentiment: calculateSentiment(paragraph),
        // Generate a search URL for the summary
        url: `https://www.google.com/search?q=${encodeURIComponent(summary)}`
      };
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}

// Helper function to calculate sentiment based on text content
function calculateSentiment(text: string): number {
  const positiveWords = ['surge', 'gain', 'rise', 'boost', 'growth', 'success', 'positive', 'breakthrough', 'innovation'];
  const negativeWords = ['drop', 'fall', 'decline', 'crash', 'loss', 'negative', 'concern', 'risk', 'warning'];

  const lowerText = text.toLowerCase();
  let sentiment = 0;

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) sentiment += 0.2;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) sentiment -= 0.2;
  });

  // Clamp sentiment between -1 and 1
  return Math.max(-1, Math.min(1, sentiment));
}

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Enable CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Handle news fetching
    if (url.pathname === "/api/news" && req.method === "GET") {
      const topic = url.searchParams.get("topic");

      if (!topic) {
        return new Response("Topic is required", { status: 400 });
      }

      try {
        const cacheKey = `news_${topic}`;
        const now = Date.now();
        const cached = cache.get(cacheKey);

        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          return new Response(JSON.stringify(cached.data), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        const news = await fetchNewsFromGrok(topic);
        cache.set(cacheKey, { data: news, timestamp: now });

        return new Response(JSON.stringify(news), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch news" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    // Serve static files from public directory
    if (url.pathname === "/") {
      return new Response(Bun.file("public/index.html"));
    }

    return new Response(Bun.file(`public${url.pathname}`));
  },
});

console.log(`Server running at http://localhost:${server.port}`);
