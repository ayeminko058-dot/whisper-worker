export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const formData = await request.formData();
      const audioFile = formData.get("file");

      if (!audioFile) {
        return new Response(JSON.stringify({ error: "No audio file uploaded" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const arrayBuffer = await audioFile.arrayBuffer();
      const audioUint8 = new Uint8Array(arrayBuffer);

      // Cloudflare Workers AI (Whisper Model)
      const aiResponse = await env.AI.run("@cf/openai/whisper", {
        audio: [...audioUint8],
      });

      return new Response(JSON.stringify(aiResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
