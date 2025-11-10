/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from "@langchain/core/messages";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
// WikipediaQueryRun not currently used
// import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { DynamicTool } from "@langchain/core/tools";
import { google } from "googleapis";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import SYSTEM_MESSAGE from "@/constants/systemMessage";

// Global variable to store current user ID for tool execution
let currentUserId: string | undefined;

// Trim the messages to manage conversation history
const trimmer = trimMessages({
  maxTokens: 50, // Increased from 10 to prevent trimming too much
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

// Initialize LangChain tools (replace previous wxflows integration)

// Wikipedia search tool
const wikipediaSearchTool = new DynamicTool({
  name: "wikipedia_search",
  description:
    "Search Wikipedia articles. Provide a search query string as input (e.g., 'Albert Einstein', 'quantum physics').",
  func: async (query: string) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&formatversion=2&srsearch=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      const results = data.query?.search || [];

      return JSON.stringify(
        results.slice(0, 5).map((item: any) => ({
          title: item.title,
          pageId: item.pageid,
          snippet: item.snippet.replace(/<[^>]+>/g, ""), // Remove HTML tags
        }))
      );
    } catch (err) {
      return `Error searching Wikipedia: ${err}`;
    }
  },
});

// Wikipedia page content tool
const wikipediaPageTool = new DynamicTool({
  name: "wikipedia_page",
  description:
    "Get full content of a Wikipedia page. Provide the page ID as input (get this from wikipedia_search first).",
  func: async (pageId: string) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&format=json&pageid=${pageId}&formatversion=2`
      );
      const data = await response.json();
      const htmlContent = data.parse?.text || "";

      // Simple text extraction from HTML
      const textContent = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 8000);

      return `Title: ${data.parse?.title || "Unknown"}\n\n${textContent}`;
    } catch (err) {
      return `Error fetching Wikipedia page: ${err}`;
    }
  },
});

const youtubeTranscriptTool = new DynamicTool({
  name: "youtube_transcript",
  description:
    "Fetch a YouTube video's transcript with timestamps for analysis. Provide the full YouTube video URL as input (e.g., 'https://www.youtube.com/watch?v=VIDEO_ID'). Optionally specify language code after a pipe (e.g., 'https://youtube.com/watch?v=abc|es' for Spanish).",
  func: async (input: string) => {
    try {
      // Parse input for URL and optional language code
      const [videoUrl, langCode = "en"] = input.split("|").map((s) => s.trim());

      // Call Tactiq API for transcript
      const response = await fetch(
        "https://tactiq-apps-prod.tactiq.io/transcript",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoUrl: videoUrl,
            langCode: langCode,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Tactiq API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Format the transcript with timestamps
      if (data.captions && data.captions.length > 0) {
        const formattedTranscript = data.captions
          .map((caption: any) => {
            const timestamp = new Date(caption.start * 1000)
              .toISOString()
              .substr(11, 8);
            return `[${timestamp}] ${caption.text}`;
          })
          .join("\n");

        return `Video: ${
          data.title || "Unknown"
        }\n\nTranscript:\n${formattedTranscript}`;
      } else {
        return "No transcript available for this video.";
      }
    } catch (err) {
      return `Error fetching transcript: ${err}`;
    }
  },
});

const googleBooksTool = new DynamicTool({
  name: "google_books_search",
  description:
    "Search Google Books. Use advanced search like 'flowers+inauthor:keyes' to find specific books. Input format: query string (e.g., 'Daniel Keyes', 'flowers+inauthor:keyes').",
  func: async (query: string) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?langRestrict=en&q=${encodeURIComponent(
          query
        )}&maxResults=5`
      );
      const data = await res.json();

      return JSON.stringify(
        data.items?.map((item: any) => ({
          volumeId: item.id,
          title: item.volumeInfo?.title,
          authors: item.volumeInfo?.authors,
        })) || []
      );
    } catch (err) {
      return `Error searching books: ${err}`;
    }
  },
});

// Google Books volume details tool
const googleBookDetailsTool = new DynamicTool({
  name: "google_book_details",
  description:
    "Get detailed information about a specific book. Provide the volumeId (from google_books_search) as input.",
  func: async (volumeId: string) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${volumeId}`
      );
      const data = await res.json();
      const info = data.volumeInfo;

      return JSON.stringify({
        title: info?.title,
        subtitle: info?.subtitle,
        authors: info?.authors,
        publisher: info?.publisher,
        publishedDate: info?.publishedDate,
        description: info?.description,
        pageCount: info?.pageCount,
        categories: info?.categories,
        averageRating: info?.averageRating,
        ratingsCount: info?.ratingsCount,
        language: info?.language,
        isbn: info?.industryIdentifiers?.[0]?.identifier,
        previewLink: info?.previewLink,
        infoLink: info?.infoLink,
      });
    } catch (err) {
      return `Error fetching book details: ${err}`;
    }
  },
});

// Dummy comments API tool (for testing/demo)
const dummyCommentsTool = new DynamicTool({
  name: "get_comments",
  description: "Get sample comments data from DummyJSON API. No input needed.",
  func: async (input: string = "") => {
    try {
      const res = await fetch("https://dummyjson.com/comments");
      const data = await res.json();

      return JSON.stringify({
        total: data.total,
        limit: data.limit,
        comments:
          data.comments?.slice(0, 5).map((comment: any) => ({
            id: comment.id,
            body: comment.body,
            postId: comment.postId,
            likes: comment.likes,
            user: {
              id: comment.user?.id,
              username: comment.user?.username,
              fullName: comment.user?.fullName,
            },
          })) || [],
      });
    } catch (err) {
      return `Error fetching comments: ${err}`;
    }
  },
});

// StepZen customers API tool
const customersTool = new DynamicTool({
  name: "get_customers",
  description:
    "Get sample customer data with orders and addresses. No input needed.",
  func: async (input: string = "") => {
    try {
      const res = await fetch(
        "https://introspection.apis.stepzen.com/customers"
      );
      const data = await res.json();

      return JSON.stringify(
        data.slice(0, 5).map((customer: any) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          address: {
            street: customer.address?.street,
            city: customer.address?.city,
            stateProvince: customer.address?.stateProvince,
            postalCode: customer.address?.postalCode,
            countryRegion: customer.address?.countryRegion,
          },
          orders: customer.orders?.map((order: any) => ({
            id: order.id,
            carrier: order.carrier,
            createdAt: order.createdAt,
            shippingCost: order.shippingCost,
            trackingId: order.trackingId,
          })),
        })) || []
      );
    } catch (err) {
      return `Error fetching customers: ${err}`;
    }
  },
});

// Calculator tool for mathematical operations
const calculatorTool = new DynamicTool({
  name: "calculator",
  description:
    "Perform mathematical calculations. Input should be a mathematical expression (e.g., '2 + 2', 'sqrt(16)', 'sin(45)'). Supports basic arithmetic, trigonometry, and common math functions.",
  func: async (expression: string) => {
    try {
      // Use Function constructor for safer eval alternative
      // Only allow basic math operations
      const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, "");
      const result = Function('"use strict"; return (' + sanitized + ")")();
      return `Result: ${result}`;
    } catch (err) {
      return `Error calculating: ${err}`;
    }
  },
});

// Web scraper tool for fetching webpage content
const webScraperTool = new DynamicTool({
  name: "web_scraper",
  description:
    "Fetch and extract text content from a webpage. Provide a URL as input.",
  func: async (url: string) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      // Simple text extraction - remove HTML tags
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 5000); // Limit to 5000 chars
      return text;
    } catch (err) {
      return `Error fetching webpage: ${err}`;
    }
  },
});

// Current date/time tool
const dateTimeTool = new DynamicTool({
  name: "current_datetime",
  description:
    "Get the current date and time. Input can be empty or a timezone (e.g., 'America/New_York', 'Europe/London', 'UTC').",
  func: async (timezone: string = "UTC") => {
    try {
      const now = new Date();
      const formatted =
        timezone && timezone.trim()
          ? now.toLocaleString("en-US", { timeZone: timezone })
          : now.toISOString();
      return `Current date/time${
        timezone ? ` in ${timezone}` : ""
      }: ${formatted}`;
    } catch (err) {
      return `Current date/time (UTC): ${new Date().toISOString()}`;
    }
  },
});

// Weather tool (using free wttr.in service)
const weatherTool = new DynamicTool({
  name: "weather",
  description:
    "Get current weather information for a location. Provide a city name or location as input (e.g., 'London', 'New York', 'Tokyo').",
  func: async (location: string) => {
    try {
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(location)}?format=j1`
      );
      const data = await response.json();
      const current = data.current_condition[0];
      const area = data.nearest_area[0];
      return JSON.stringify({
        location: `${area.areaName[0].value}, ${area.country[0].value}`,
        temperature: `${current.temp_C}°C (${current.temp_F}°F)`,
        condition: current.weatherDesc[0].value,
        humidity: `${current.humidity}%`,
        windSpeed: `${current.windspeedKmph} km/h`,
        feelsLike: `${current.FeelsLikeC}°C`,
      });
    } catch (err) {
      return `Error fetching weather: ${err}`;
    }
  },
});

// Currency converter tool
const currencyConverterTool = new DynamicTool({
  name: "currency_converter",
  description:
    "Convert between currencies. Input format: 'amount FROM TO' (e.g., '100 USD EUR', '50 GBP JPY'). Uses live exchange rates.",
  func: async (input: string) => {
    try {
      const parts = input.trim().split(/\s+/);
      if (parts.length !== 3) {
        return "Invalid format. Use: 'amount FROM TO' (e.g., '100 USD EUR')";
      }
      const [amount, from, to] = parts;
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`
      );
      const data = await response.json();
      const rate = data.rates[to.toUpperCase()];
      if (!rate) {
        return `Currency ${to.toUpperCase()} not found`;
      }
      const result = parseFloat(amount) * rate;
      return `${amount} ${from.toUpperCase()} = ${result.toFixed(
        2
      )} ${to.toUpperCase()}`;
    } catch (err) {
      return `Error converting currency: ${err}`;
    }
  },
});

// News headlines tool (using free NewsAPI alternative)
const newsHeadlinesTool = new DynamicTool({
  name: "news_headlines",
  description:
    "Get latest news headlines. Provide a topic or category as input (e.g., 'technology', 'business', 'science', 'sports').",
  func: async (topic: string = "general") => {
    try {
      // Using NewsData.io free tier alternative or RSS feeds
      const response = await fetch(
        `https://rss.nytimes.com/services/xml/rss/nyt/${encodeURIComponent(
          topic
        )}.xml`
      );
      const xml = await response.text();
      // Simple XML parsing for titles
      const titles = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)]
        .slice(0, 5)
        .map((match) => match[1]);
      return titles.length > 0
        ? `Latest headlines in ${topic}:\n${titles
            .map((t, i) => `${i + 1}. ${t}`)
            .join("\n")}`
        : "No headlines found";
    } catch (err) {
      return `Error fetching news: ${err}`;
    }
  },
});

// Academic search tool for research papers
const academicSearchTool = new DynamicTool({
  name: "academic_search",
  description:
    "Search for academic papers and research articles. Provide keywords or research topic as input (e.g., 'machine learning emotion recognition', 'adaptive music recommendation'). Returns paper titles, authors, and abstracts from multiple academic sources.",
  func: async (query: string) => {
    try {
      // Use Google Scholar via scraping (be respectful of rate limits)
      const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(
        query
      )}&hl=en&as_sdt=0,5`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const html = await response.text();

      // Extract paper information (basic parsing)
      const papers: any[] = [];
      const titleMatches = [
        ...html.matchAll(/<h3 class="gs_rt">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/g),
      ];
      const snippetMatches = [
        ...html.matchAll(/<div class="gs_rs">([\s\S]*?)<\/div>/g),
      ];
      for (let i = 0; i < Math.min(5, titleMatches.length); i++) {
        const title = titleMatches[i][1].replace(/<[^>]+>/g, "").trim();
        const snippet = snippetMatches[i]
          ? snippetMatches[i][1].replace(/<[^>]+>/g, "").trim()
          : "";
        papers.push({
          title,
          snippet: snippet.substring(0, 200),
        });
      }

      return JSON.stringify(
        {
          query,
          count: papers.length,
          papers,
        },
        null,
        2
      );
    } catch (err) {
      return `Error searching academic papers: ${err}. Try using web_scraper with specific academic URLs instead.`;
    }
  },
});

// arXiv research papers tool
const arxivTool = new DynamicTool({
  name: "arxiv_search",
  description:
    "Search arXiv.org for research papers in computer science, AI, physics, math, etc. Provide search query as input (e.g., 'deep learning', 'quantum computing').",
  func: async (query: string) => {
    try {
      const response = await fetch(
        `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
          query
        )}&start=0&max_results=5`
      );
      const xml = await response.text();

      // Parse XML for entries
      const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
      const papers = entries.map((entry) => {
        const content = entry[1];
        const title = content
          .match(/<title>([\s\S]*?)<\/title>/)?.[1]
          ?.trim()
          .replace(/\s+/g, " ");
        const summary = content
          .match(/<summary>([\s\S]*?)<\/summary>/)?.[1]
          ?.trim()
          .replace(/\s+/g, " ");
        const authors = [
          ...content.matchAll(/<author>[\s\S]*?<name>(.*?)<\/name>/g),
        ].map((m) => m[1]);
        const published = content.match(/<published>(.*?)<\/published>/)?.[1];
        const link = content.match(/<id>(.*?)<\/id>/)?.[1];

        return {
          title,
          authors: authors.join(", "),
          published: published?.split("T")[0],
          summary: summary?.substring(0, 300) + "...",
          link,
        };
      });

      return JSON.stringify(
        {
          query,
          source: "arXiv.org",
          count: papers.length,
          papers,
        },
        null,
        2
      );
    } catch (err) {
      return `Error searching arXiv: ${err}`;
    }
  },
});

// Google Calendar tool
const calendarTool = new DynamicTool({
  name: "schedule_meeting",
  description: `Schedule a meeting on Google Calendar. Input must be a JSON string with:
  - title: string (meeting title)
  - startTime: string (ISO datetime, e.g. "2025-11-14T14:00:00" - IMPORTANT: Use the current year from the system message!)
  - endTime: string (ISO datetime)
  - attendees: string[] (email addresses, optional)
  - description: string (optional)
  Example: {"title":"Team Sync","startTime":"2025-11-14T14:00:00","endTime":"2025-11-14T15:00:00","attendees":["person@example.com"],"description":"Weekly team meeting"}
  
  CRITICAL: Always use the current year (2025) when scheduling events. Check the CURRENT DATE in the system message before creating dates.
  
  Note: User must connect their Google Calendar in Settings first. If not connected, explain they need to go to Settings and connect Google Calendar.`,
  func: async (input: string, runManager) => {
    try {
      const params = JSON.parse(input);
      console.log("📅 Calendar tool called with params:", params);

      // Get userId from the global variable
      const userId = currentUserId;

      if (!userId) {
        return "Unable to identify user. Please try again.";
      }

      console.log("👤 User ID:", userId);

      // Import Convex client dynamically to avoid circular dependencies
      const { getConvexClient } = await import("@/lib/convex");
      const { api } = await import("@/convex/_generated/api");
      const convex = getConvexClient();

      // Get user's Google Calendar tokens
      const tokens = await convex.query(api.integrations.getGoogleTokens, {
        userId: userId,
      });

      console.log("🔑 Tokens retrieved:", tokens ? "Yes" : "No");

      if (!tokens) {
        return `I need access to your Google Calendar to schedule meetings. Please:

1. Go to Settings (click the gear icon in the sidebar)
2. Click "Connect" on the Google Calendar card
3. Authorize Netics AI to access your calendar

Once connected, I'll be able to schedule this meeting for you!`;
      }

      // Initialize Google Calendar API
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expiry_date: tokens.expiryDate,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // Create the calendar event
      const event = {
        summary: params.title,
        description: params.description || "",
        start: {
          dateTime: params.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: params.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: params.attendees?.map((email: string) => ({ email })) || [],
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      console.log("✅ Calendar event created:", {
        id: response.data.id,
        summary: response.data.summary,
        htmlLink: response.data.htmlLink,
        start: response.data.start,
        end: response.data.end,
      });

      return `✅ Meeting scheduled successfully!

📅 **${response.data.summary}**
🕒 ${new Date(params.startTime).toLocaleString()} - ${new Date(
        params.endTime
      ).toLocaleTimeString()}
${
  params.attendees && params.attendees.length > 0
    ? `👥 Attendees: ${params.attendees.join(", ")}\n`
    : ""
}
🔗 [View in Google Calendar](${response.data.htmlLink})`;
    } catch (error: any) {
      console.error("❌ Calendar tool error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        errors: error.errors,
        response: error.response?.data,
      });

      if (error.message?.includes("invalid_grant") || error.code === 401) {
        return `Your Google Calendar connection has expired. Please:

1. Go to Settings
2. Disconnect Google Calendar
3. Connect it again

Then I'll be able to schedule meetings for you!`;
      }

      return `Error scheduling meeting: ${
        error.message || "Unknown error"
      }. Please try again or check your calendar connection in Settings.`;
    }
  },
});

const tools = [
  wikipediaSearchTool,
  wikipediaPageTool,
  youtubeTranscriptTool,
  googleBooksTool,
  googleBookDetailsTool,
  calendarTool,
  academicSearchTool,
  arxivTool,
  dummyCommentsTool,
  customersTool,
  calculatorTool,
  webScraperTool,
  dateTimeTool,
  weatherTool,
  currencyConverterTool,
  newsHeadlinesTool,
];
const toolNode = new ToolNode(tools);

// Connect to the LLM provider with better tool instructions
const initialiseModel = () => {
  const model = new ChatAnthropic({
    modelName: "claude-sonnet-4-20250514",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    clientOptions: {
      defaultHeaders: {
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
    },
    callbacks: [
      {
        handleLLMStart: async () => {
          // console.log("🤖 Starting LLM call");
        },
        handleLLMEnd: async (output) => {
          console.log("🤖 End LLM call", output);
          const usage = output.llmOutput?.usage;
          if (usage) {
            // console.log("📊 Token Usage:", {
            //   input_tokens: usage.input_tokens,
            //   output_tokens: usage.output_tokens,
            //   total_tokens: usage.input_tokens + usage.output_tokens,
            //   cache_creation_input_tokens:
            //     usage.cache_creation_input_tokens || 0,
            //   cache_read_input_tokens: usage.cache_read_input_tokens || 0,
            // });
          }
        },
        // handleLLMNewToken: async (token: string) => {
        //   // console.log("🔤 New token:", token);
        // },
      },
    ],
  }).bindTools(tools);

  return model;
};

// Define the function that determines whether to continue or not
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  // If the last message is a tool message, route back to agent
  if (lastMessage.content && lastMessage._getType() === "tool") {
    return "agent";
  }

  // Otherwise, we stop (reply to the user)
  return END;
}

// Define a new graph
const createWorkflow = () => {
  const model = initialiseModel();

  return new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      // Create the system message content
      const systemContent = SYSTEM_MESSAGE;

      // Create the prompt template with system message and messages placeholder
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: "ephemeral" },
        }),
        new MessagesPlaceholder("messages"),
      ]);

      // Trim the messages to manage conversation history
      const trimmedMessages = await trimmer.invoke(state.messages);

      // Format the prompt with the current messages
      const prompt = await promptTemplate.invoke({ messages: trimmedMessages });

      // Get response from the model
      const response = await model.invoke(prompt);

      return { messages: [response] };
    })
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");
};

function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
  if (!messages.length) return messages;

  // Create a copy of messages to avoid mutating the original
  const cachedMessages = [...messages];

  // Helper to add cache control
  const addCache = (message: BaseMessage) => {
    message.content = [
      {
        type: "text",
        text: message.content as string,
        cache_control: { type: "ephemeral" },
      },
    ];
  };

  // Cache the last message
  // console.log("🤑🤑🤑 Caching last message");
  addCache(cachedMessages.at(-1)!);

  // Find and cache the second-to-last human message
  let humanCount = 0;
  for (let i = cachedMessages.length - 1; i >= 0; i--) {
    if (cachedMessages[i] instanceof HumanMessage) {
      humanCount++;
      if (humanCount === 2) {
        // console.log("🤑🤑🤑 Caching second-to-last human message");
        addCache(cachedMessages[i]);
        break;
      }
    }
  }

  return cachedMessages;
}

export async function submitQuestion(
  messages: BaseMessage[],
  chatId: string | null,
  userId?: string
) {
  // Store userId in global variable for tool access
  currentUserId = userId;

  // Add caching headers to messages
  const cachedMessages = addCachingHeaders(messages);
  // console.log("🔒🔒🔒 Messages:", cachedMessages);

  // Create workflow with chatId and onToken callback
  const workflow = createWorkflow();

  // Create a checkpoint to save the state of the conversation (only if chatId is provided)
  const config = chatId ? { configurable: { thread_id: chatId } } : {};
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });

  const stream = await app.streamEvents(
    { messages: cachedMessages },
    {
      version: "v2",
      configurable: { thread_id: chatId || "voice-session" },
      streamMode: "messages",
      runId: chatId || undefined,
      metadata: { userId }, // Pass userId through metadata
    }
  );
  return stream;
}
