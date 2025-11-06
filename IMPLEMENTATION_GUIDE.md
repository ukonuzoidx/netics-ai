# Netics AI - Implementation Guide

## 🚀 Week 1: Calendar Integration (Highest Priority)

### Goal: Let users schedule meetings via chat

### Step 1: Install Dependencies
```bash
pnpm add googleapis @google-cloud/local-auth
pnpm add -D @types/google.auth
```

### Step 2: Set Up Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create new project "Netics AI"
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Download credentials.json

### Step 3: Add Environment Variables
```env
# .env.local
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Step 4: Create Calendar Tool

Add to `lib/langgraph.ts`:

```typescript
import { google } from 'googleapis';

const calendarTool = new DynamicTool({
  name: "schedule_meeting",
  description: `Schedule a meeting on Google Calendar. Input must be JSON with:
  - title: string (meeting title)
  - startTime: string (ISO datetime, e.g. "2025-11-05T14:00:00")
  - endTime: string (ISO datetime)
  - attendees: string[] (email addresses, optional)
  - description: string (optional)
  Example: {"title":"Team Sync","startTime":"2025-11-05T14:00:00","endTime":"2025-11-05T15:00:00"}`,
  func: async (input: string) => {
    try {
      const params = JSON.parse(input);
      
      // TODO: Get user's access token from Convex based on userId
      // For now, we'll need to implement OAuth flow first
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      
      // Set credentials (will come from user's stored token)
      // oauth2Client.setCredentials(userToken);
      
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const event = {
        summary: params.title,
        description: params.description || '',
        start: {
          dateTime: params.startTime,
          timeZone: 'America/New_York', // TODO: Get from user preferences
        },
        end: {
          dateTime: params.endTime,
          timeZone: 'America/New_York',
        },
        attendees: params.attendees?.map((email: string) => ({ email })) || [],
        reminders: {
          useDefault: true,
        },
      };
      
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      
      return `Meeting scheduled successfully! 
Event ID: ${response.data.id}
Link: ${response.data.htmlLink}`;
    } catch (error) {
      return `Error scheduling meeting: ${error}`;
    }
  },
});
```

### Step 5: Create OAuth Flow

Create `app/api/auth/google/route.ts`:

```typescript
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  return NextResponse.redirect(url);
}
```

Create `app/api/auth/google/callback/route.ts`:

```typescript
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect('/');
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in Convex
    const convex = getConvexClient();
    await convex.mutation(api.integrations.storeGoogleTokens, {
      userId,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiryDate: tokens.expiry_date!,
    });

    return NextResponse.redirect('/dashboard?connected=google');
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 });
  }
}
```

### Step 6: Add Convex Schema for Integrations

Add to `convex/schema.ts`:

```typescript
integrations: defineTable({
  userId: v.string(),
  service: v.string(), // "google", "outlook", etc.
  accessToken: v.string(),
  refreshToken: v.optional(v.string()),
  expiryDate: v.optional(v.number()),
  scopes: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_service", ["userId", "service"]),
```

### Step 7: Create Integration Mutation

Create `convex/integrations.ts`:

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const storeGoogleTokens = mutation({
  args: {
    userId: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiryDate: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_service", (q) => 
        q.eq("userId", args.userId).eq("service", "google")
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("integrations", {
        userId: args.userId,
        service: "google",
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
        scopes: ["calendar", "calendar.events"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const getGoogleTokens = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_service", (q) => 
        q.eq("userId", args.userId).eq("service", "google")
      )
      .first();
  },
});
```

---

## 🗣️ Week 2: Voice Input/Output

### Goal: Talk to Netics AI instead of typing

### Step 1: Install Dependencies
```bash
pnpm add elevenlabs react-speech-recognition
pnpm add -D @types/dom-speech-recognition
```

### Step 2: Add Voice Input to ChatInterface

Update `components/ChatInterface.tsx`:

```typescript
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';

// Inside component
const {
  transcript,
  listening,
  resetTranscript,
  browserSupportsSpeechRecognition
} = useSpeechRecognition();

// Add voice button
<Button
  type="button"
  onClick={() => {
    if (listening) {
      SpeechRecognition.stopListening();
      setInput(transcript);
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  }}
  className="absolute right-14"
>
  {listening ? <MicOff className="text-red-500" /> : <Mic />}
</Button>
```

### Step 3: Add Text-to-Speech

Create `lib/elevenlabs.ts`:

```typescript
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const audio = await client.generate({
    voice: "Rachel", // Or any voice ID
    text,
    model_id: "eleven_monolingual_v1",
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
```

Add API route `app/api/tts/route.ts`:

```typescript
import { textToSpeech } from '@/lib/elevenlabs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  
  const audio = await textToSpeech(text);
  
  return new NextResponse(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
    },
  });
}
```

---

## 📱 Week 3: Settings & Connected Accounts Page

### Create `app/dashboard/settings/page.tsx`:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export default function SettingsPage() {
  const { userId } = useAuth();
  const integrations = useQuery(api.integrations.list, { 
    userId: userId || "" 
  });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
        
        <div className="space-y-4">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Google Calendar</h3>
              <p className="text-sm text-gray-600">
                Schedule meetings, check availability
              </p>
            </div>
            {integrations?.find(i => i.service === "google") ? (
              <Button variant="outline" disabled>
                ✓ Connected
              </Button>
            ) : (
              <Button onClick={() => window.location.href = "/api/auth/google"}>
                Connect
              </Button>
            )}
          </div>
          
          {/* Add more integrations here */}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        {/* Add user preferences UI */}
      </section>
    </div>
  );
}
```

---

## 📸 Week 4: Image & File Upload

### Step 1: Add Vision Capability

Update `lib/langgraph.ts` to use Claude's vision:

```typescript
const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20241022",
  temperature: 0,
  apiKey: process.env.ANTHROPIC_API_KEY,
  // Vision is automatically supported
});
```

### Step 2: Add File Upload to ChatInterface

```typescript
// Add state
const [selectedFile, setSelectedFile] = useState<File | null>(null);

// Add file input
<input
  type="file"
  accept="image/*,application/pdf"
  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
  className="hidden"
  id="file-upload"
/>
<Button
  type="button"
  onClick={() => document.getElementById('file-upload')?.click()}
>
  <Paperclip />
</Button>
```

### Step 3: Handle Image in API

Update `app/api/chat/stream/route.ts` to handle base64 images:

```typescript
// Convert image to base64
if (file) {
  const base64 = await fileToBase64(file);
  messages.push({
    role: "user",
    content: [
      { type: "text", text: userMessage },
      { 
        type: "image", 
        source: {
          type: "base64",
          media_type: file.type,
          data: base64,
        }
      }
    ]
  });
}
```

---

## 🎯 Priority Order for Maximum Impact

### Week 1: Google Calendar (Immediate Value)
✅ Users can schedule meetings via chat
✅ Shows tangible productivity benefit
✅ Easiest to demonstrate

### Week 2: Voice Interface (Wow Factor)
✅ Makes it feel futuristic
✅ Hands-free operation
✅ Accessibility improvement

### Week 3: Settings Page (User Control)
✅ Build trust with permissions
✅ Multiple account management
✅ Professional appearance

### Week 4: Vision/Files (Advanced AI)
✅ Analyze receipts for expenses
✅ Extract data from documents
✅ Image-based queries

---

## 🔧 Quick Wins (Do Today)

1. **Update system message** to mention Netics AI capabilities
2. **Add "Schedule a meeting" example** to WelcomeMessage
3. **Create Settings link** in Header/Sidebar
4. **Add loading states** for better UX
5. **Error handling** for tool failures

---

## 📊 Metrics to Track

1. **User Engagement**
   - Messages per session
   - Tool usage frequency
   - Return rate

2. **Tool Performance**
   - Success rate per tool
   - Average execution time
   - Error rates

3. **Feature Adoption**
   - % users connecting accounts
   - Most used tools
   - Voice vs text ratio

---

## 🚨 Common Pitfalls to Avoid

1. **Don't build everything at once** - Ship iteratively
2. **Don't skip OAuth security** - Use PKCE, validate tokens
3. **Don't ignore rate limits** - Implement caching & queuing
4. **Don't forget error messages** - User-friendly explanations
5. **Don't hardcode timezones** - Use user preferences
6. **Don't store tokens in plain text** - Encrypt in database

---

## 🎓 Learning Resources

### LangChain & AI Agents
- [LangChain Documentation](https://js.langchain.com/docs/)
- [LangGraph Tutorial](https://langchain-ai.github.io/langgraphjs/)

### Google APIs
- [Google Calendar API Guide](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2)

### Voice AI
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [ElevenLabs Docs](https://elevenlabs.io/docs)

### Anthropic Claude
- [Claude Vision Guide](https://docs.anthropic.com/claude/docs/vision)
- [Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)

---

**Remember**: Start small, validate with users, iterate quickly. Don't aim for perfection—aim for usefulness! 🚀
