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
        return new Response(JSON.stringify({ error: "Empty audio buffer" }), { status: 400 });
      }

      const audioUint8 = new Uint8Array(arrayBuffer);

      // Cloudflare Whisper AI ကို Timestamps (VTT) ပါအောင် တောင်းဆိုခြင်း
      const response = await env.AI.run("@cf/openai/whisper", {
        audio: [...audioUint8],
      });

      console.log("Whisper Output:", JSON.stringify(response));

      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      console.error("Worker Error:", e.message);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  },
};
