export default {
  async fetch(request, env) {
    // CORS headers Handling
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
      // Audio Buffer ကို Direct ဖတ်ခြင်း
      const arrayBuffer = await request.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return new Response(JSON.stringify({ error: "No audio data received" }), { status: 400 });
      }

      const audioUint8 = new Uint8Array(arrayBuffer);

      // Whisper AI Config - မြန်မာဘာသာ (my) အတွက် Parameter သေချာ ထည့်သွင်းခြင်း
      const response = await env.AI.run("@cf/openai/whisper", {
        audio: [...audioUint8],
        task: "transcribe",
        language: "my" // Myanmar language code သတ်မှတ်ပေးခြင်း (သို့မဟုတ် auto အစား transcribe တိုက်ရိုက်လုပ်ခိုင်းခြင်း)
      });

      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  },
};
