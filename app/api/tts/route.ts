import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    console.log("🔊 TTS Request received, text length:", text?.length);

    if (!text) {
      console.error("❌ No text provided");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Limit text length for TTS
    const truncatedText = text.substring(0, 1000);

    // Try OpenAI TTS if API key is available
    if (process.env.OPENAI_API_KEY) {
      console.log("🎙️ Using OpenAI TTS...");
      try {
        const openaiResponse = await fetch(
          "https://api.openai.com/v1/audio/speech",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "tts-1",
              voice: "alloy",
              input: truncatedText,
            }),
          }
        );

        if (openaiResponse.ok) {
          const audioBuffer = await openaiResponse.arrayBuffer();
          console.log(
            "✅ OpenAI TTS audio generated, size:",
            audioBuffer.byteLength,
            "bytes"
          );

          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.byteLength.toString(),
            },
          });
        } else {
          console.warn("⚠️ OpenAI TTS failed:", openaiResponse.status);
        }
      } catch (openaiError) {
        console.warn("⚠️ OpenAI TTS error, falling back:", openaiError);
      }
    }

    // Fallback: Try multiple Google TTS endpoints
    console.log("📥 Trying Google TTS endpoints...");

    const endpoints = [
      // Method 1: Standard endpoint
      `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(
        truncatedText
      )}`,
      // Method 2: Alternative endpoint
      `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=gtx&q=${encodeURIComponent(
        truncatedText
      )}`,
    ];

    for (let i = 0; i < endpoints.length; i++) {
      try {
        console.log(`� Trying endpoint ${i + 1}/${endpoints.length}...`);
        const response = await fetch(endpoints[i], {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Referer: "https://translate.google.com/",
          },
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();

          if (audioBuffer.byteLength > 100) {
            console.log(
              "✅ Google TTS audio generated, size:",
              audioBuffer.byteLength,
              "bytes"
            );
            return new NextResponse(audioBuffer, {
              headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString(),
              },
            });
          } else {
            console.warn(`⚠️ Endpoint ${i + 1} returned too small audio`);
          }
        } else {
          console.warn(`⚠️ Endpoint ${i + 1} failed:`, response.status);
        }
      } catch (endpointError) {
        console.warn(`⚠️ Endpoint ${i + 1} error:`, endpointError);
      }
    }

    // All methods failed - return a signal to use browser TTS
    console.log("⚠️ All TTS services failed, returning use-browser-tts signal");
    return NextResponse.json(
      {
        useBrowserTTS: true,
        text: truncatedText,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Text-to-speech error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        useBrowserTTS: true,
        text: "",
        error: "Failed to generate speech",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 200 } // Return 200 so client can handle browser TTS fallback
    );
  }
}
