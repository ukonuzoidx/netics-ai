import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    console.log("🔊 TTS Request received, text length:", text?.length);

    if (!text) {
      console.error("❌ No text provided");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("❌ ElevenLabs API key not configured");
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    console.log("🎙️ Calling ElevenLabs API...");

    // Generate speech using ElevenLabs
    // Using eleven_turbo_v2_5 which is available on free tier
    const audioStream = await elevenlabs.textToSpeech.convert(
      "21m00Tcm4TlvDq8ikWAM", // Rachel voice ID
      {
        text: text,
        modelId: "eleven_turbo_v2_5", // Updated to use turbo v2.5 model (free tier compatible)
        outputFormat: "mp3_44100_128",
      }
    );

    console.log("📥 Audio stream received, converting to buffer...");

    // Convert the ReadableStream to a buffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioBuffer = Buffer.concat(chunks);

    console.log("✅ Audio generated, size:", audioBuffer.length, "bytes");

    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
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
