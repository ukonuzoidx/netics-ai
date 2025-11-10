import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    console.log("🔊 TTS Request received, text length:", text?.length);

    if (!text) {
      console.error("❌ No text provided");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    console.log("🎙️ Generating speech with Web Speech API...");

    // Use Web Speech API compatible format
    // We'll return a simple response that the client can use with browser's native TTS
    // OR use a free service like Google Cloud TTS (free tier: 4M characters/month)

    // For now, let's use a simple server-side solution with a free API
    // Using Google Translate TTS (unofficial but free)
    const encodedText = encodeURIComponent(text.substring(0, 200)); // Limit to 200 chars
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodedText}`;

    console.log("📥 Fetching audio from Google TTS...");

    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`TTS service error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    console.log("✅ Audio generated, size:", audioBuffer.byteLength, "bytes");

    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("❌ Text-to-speech error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: "Failed to generate speech",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
