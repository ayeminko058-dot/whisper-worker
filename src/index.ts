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
        const contentType = request.headers.get("content-type") || "";
        let audioBuffer: ArrayBuffer;

        if (contentType.includes("multipart/form-data")) {
          // App is sending FormData with a file field
          const form = await request.formData();

          // Try common field names in order
          let file =
            (form.get("audio") as File | null) ||
            (form.get("file") as File | null) ||
            (form.get("audioFile") as File | null);

          // Fallback: grab the first File-like value in the form
          if (!file) {
            for (const value of form.values()) {
              if (value instanceof File) {
                file = value;
                break;
              }
            }
          }

          if (!file) {
            return Response.json(
              { error: "No audio file found in form data. Expected a field named 'audio'." },
              { status: 400, headers: CORS_HEADERS }
            );
          }

          audioBuffer = await file.arrayBuffer();
        } else {
          // Raw binary body fallback
          audioBuffer = await request.arrayBuffer();
        }

        if (!audioBuffer || audioBuffer.byteLength === 0) {
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
