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
      const formData = await request.formData();
      const file = formData.get("file");
      
      if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioUint8 = new Uint8Array(arrayBuffer);

      // Whisper AI ဆီကနေ Timestamps (vtt/segments) ပါအောင် တောင်းယူခြင်း
      const response = await env.AI.run("@cf/openai/whisper", {
        audio: [...audioUint8],
      });

      // Log ကြည့်လို့ရအောင် ထုတ်ပြခိုင်းခြင်း
      console.log("Whisper AI Output:", JSON.stringify(response));

      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      console.error("Error:", e.message);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  },
};
