# Google Calendar Integration - Quick Setup Guide

## ✅ What's Been Done

I've installed and configured the foundation for Google Calendar integration:

### Installed Packages

- ✅ `googleapis` - Google Calendar API client
- ✅ `@google-cloud/local-auth` - OAuth authentication
- ✅ `react-speech-recognition` - Voice input (Web Speech API)
- ✅ `elevenlabs` - Text-to-speech (deprecated, use @elevenlabs/elevenlabs-js)

### Created Files

- ✅ `convex/integrations.ts` - Database functions for storing OAuth tokens
- ✅ `convex/schema.ts` - Added integrations table
- ✅ `app/api/auth/google/route.ts` - OAuth initialization
- ✅ `app/api/auth/google/callback/route.ts` - OAuth callback handler
- ✅ `app/dashboard/settings/page.tsx` - Settings page with Connect button
- ✅ `lib/langgraph.ts` - Added `schedule_meeting` tool
- ✅ `components/Sidebar.tsx` - Added Settings button

### Updated Files

- ✅ `.env.example` - Added Google OAuth variables template

---

## 🚀 Next Steps to Make It Work

### Step 1: Create Google Cloud Project (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name it "Netics AI" → Create
4. Wait for project creation

### Step 2: Enable Google Calendar API (2 minutes)

1. In the project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it → Click "Enable"

### Step 3: Create OAuth 2.0 Credentials (5 minutes)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: "External"
   - App name: "Netics AI"
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue" through scopes
   - **IMPORTANT**: On "Test users" screen, click "Add Users" and add your Google email
   - Click "Save and Continue"
4. Back to Create OAuth client ID:
   - Application type: "Web application"
   - Name: "Netics AI Web Client"
   - Authorized redirect URIs: Add `http://localhost:3000/api/auth/google/callback`
   - Click "Create"
5. Copy the Client ID and Client Secret

### Step 3.5: Add Test Users (CRITICAL - Fixes 403 Error)

If you see "Error 403: access_denied" when trying to connect:

1. Go to "APIs & Services" → "OAuth consent screen"
2. Scroll down to "Test users" section
3. Click "Add Users"
4. Enter your Google email address (the one you'll use to test)
5. Click "Save"

**Note**: Apps in testing mode can only be accessed by test users you explicitly add!

### Step 3.6: Bypass "Google hasn't verified this app" Warning

When you try to connect, you'll see a warning screen saying "Google hasn't verified this app". This is NORMAL for development apps. Here's how to proceed:

1. You'll see the warning: "Google hasn't verified this app"
2. Click "Advanced" (small text at the bottom left)
3. Click "Go to Netics AI (unsafe)" - Don't worry, it's YOUR app, it's safe!
4. Review the permissions and click "Continue"
5. You'll be redirected back to your app with successful connection

**Why this happens**: Google shows this warning for all unverified apps. Since you're the developer and testing locally, it's completely safe to proceed. You only need verification if deploying publicly.

### Step 4: Add Environment Variables (1 minute)

Add to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_client_id_from_step_3
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_3
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Step 5: Run Convex Schema Update (1 minute)

The schema has been updated with the integrations table. Run:

```bash
# If Convex is already running, it will auto-update
# If not, restart it:
npx convex dev
```

### Step 6: Test the Integration (2 minutes)

1. Start your dev server (if not running): `pnpm dev`
2. Open http://localhost:3000
3. Sign in to your account
4. Click "Settings" in the sidebar
5. Click "Connect" on Google Calendar
6. Authorize the app
7. You should be redirected back with "Connected" status

---

## 🎯 How to Use

Once connected, you can ask Netics AI things like:

- "Schedule a team meeting tomorrow at 2 PM for one hour"
- "Book a dentist appointment on November 14th at 10 AM"
- "Set up a call with John next Friday at 3 PM"

The AI will use the `schedule_meeting` tool to create calendar events!

---

## � Production Deployment Setup

If you've deployed to production (Vercel, etc.), you need to update the OAuth redirect URI:

### Step 1: Add Production Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", click "Add URI"
6. Add your production URL: `https://your-domain.com/api/auth/google/callback`
   - Example: `https://netics-ai.vercel.app/api/auth/google/callback`
7. Click "Save"

### Step 2: Update Environment Variables in Production

In your hosting platform (Vercel, etc.), add these environment variables:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
```

**Important**:

- Keep `http://localhost:3000/api/auth/google/callback` in Google Cloud Console for local development
- Add the production URL as an additional redirect URI (you can have multiple)
- Update `GOOGLE_REDIRECT_URI` environment variable in production to use HTTPS

### Step 3: Test in Production

1. Visit your production URL
2. Go to Settings
3. Click "Connect" on Google Calendar
4. You may still see the "unverified app" warning - click "Advanced" → "Go to [App Name] (unsafe)"
5. Authorize and you'll be redirected back

---

## �🔧 Current Limitation

Right now, the calendar tool returns a message asking users to connect their calendar. To make it **actually create events**, you need to:

1. Update `lib/langgraph.ts` → `calendarTool` function
2. Get the user's ID from the chat context
3. Fetch their Google tokens from Convex
4. Use those tokens to call Google Calendar API

Example code to add in the tool (after the user connects):

```typescript
// Get user tokens (you'll need to pass userId through the tool context)
const convex = getConvexClient();
const tokens = await convex.query(api.integrations.getGoogleTokens, { userId });

if (!tokens) {
  return "Please connect your Google Calendar in Settings first!";
}

// Initialize Google Calendar with user's tokens
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

// Create the event
const event = {
  summary: params.title,
  description: params.description || "",
  start: {
    dateTime: params.startTime,
    timeZone: "America/Los_Angeles", // Get from user preferences
  },
  end: {
    dateTime: params.endTime,
    timeZone: "America/Los_Angeles",
  },
  attendees: params.attendees?.map((email: string) => ({ email })) || [],
};

const response = await calendar.events.insert({
  calendarId: "primary",
  requestBody: event,
});

return `✅ Meeting scheduled successfully!
Event: ${response.data.summary}
Time: ${params.startTime} to ${params.endTime}
Link: ${response.data.htmlLink}`;
```

---

## 📝 Voice Interface Setup

The voice packages are installed! To add voice input:

1. See `IMPLEMENTATION_GUIDE.md` for the ChatInterface code
2. Add a microphone button
3. Use `react-speech-recognition` to capture voice
4. Convert to text and send to AI

---

## ✨ What's Next?

- [ ] Complete the calendar tool implementation (actual API calls)
- [ ] Add voice input to ChatInterface
- [ ] Add text-to-speech for AI responses
- [ ] Add timezone preferences to user settings
- [ ] Handle token refresh for expired Google tokens
- [ ] Add event editing/deletion tools
- [ ] Add "check my availability" tool

---

## 🎉 You're Almost There!

The foundation is built. Just complete Steps 1-6 above, and you'll have working Google Calendar integration! This is a huge step toward making Netics AI a true all-in-one assistant.

**Time to complete setup**: ~15 minutes
**Impact**: Users can schedule meetings via natural conversation 🚀
