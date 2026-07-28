export interface Env {
  AI: Ai;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === "/transcribe" && request.method === "POST") {
      try {
        const audioBuffer = await request.arrayBuffer();

        if (audioBuffer.byteLength === 0) {
          return Response.json(
            { error: "No audio data received" },
            { status: 400, headers: CORS_HEADERS }
          );
        }

        const result: any = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
          audio: [...new Uint8Array(audioBuffer)],
          language: "my",
          task: "transcribe",
          vad_filter: true,
          initial_prompt: "မြန်မာဘာသာဖြင့် ရိုက်ကူးထားသော အသံဖိုင်ဖြစ်ပါသည်။",
        });

        // result.text = full transcript
        // result.words = [{ word, start, end }, ...]  <-- timestamps for AI Studio app to use
        return Response.json(result, { headers: CORS_HEADERS });
      } catch (err: any) {
        return Response.json(
          { error: err?.message || "Transcription failed" },
          { status: 500, headers: CORS_HEADERS }
        );
      }
    }

    return new Response("Not found. POST audio to /transcribe", {
      status: 404,
      headers: CORS_HEADERS,
    });
  },
};
