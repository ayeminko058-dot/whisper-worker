export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const arrayBuffer = await request.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return new Response(JSON.stringify({ error: "No audio data received" }), { status: 400 });
      }

      const audioUint8 = new Uint8Array(arrayBuffer);

      // Model ကို whisper-large-v3-turbo သို့ ပြောင်းလဲအသုံးပြုခြင်း
      const response = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
        audio: [...audioUint8],
        task: "transcribe",
        language: "my"
      });

      console.log("WHISPER_V3_TURBO_OUTPUT:", JSON.stringify(response));

      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      console.error("WHISPER_ERROR:", e.message);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  },
};
