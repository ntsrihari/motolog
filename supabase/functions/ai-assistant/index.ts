import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

interface AiRequest {
  type: 'vehicle_inference' | 'anomaly_analysis' | 'diary_pattern' | 'maintenance_alert';
  prompt: string;
  context?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AiRequest = await req.json();

    const systemPrompt = `You are MotoLog's AI assistant — India's smartest vehicle intelligence layer.
You are deeply familiar with Indian vehicles, RTO regulations, Indian driving conditions, fuel prices,
and the full spectrum of Indian car and bike owners — from family hatchback drivers to track-day enthusiasts.

Rules:
- Always respond in JSON when asked for structured data
- India-first: ₹ INR, km, litres, DD/MM/YYYY, Indian registration formats
- PUC is as important as insurance — treat it equally
- Mirror user's technical level: casual for family owners, peer-level for enthusiasts
- Never fabricate OEM service intervals — flag when unavailable
- Be specific: include vehicle name, odometer estimate, next action in every suggestion`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: body.prompt,
        },
      ],
      system: systemPrompt,
    });

    const textContent = message.content.find((c) => c.type === 'text');
    let data: unknown = null;

    if (textContent?.type === 'text') {
      try {
        data = JSON.parse(textContent.text);
      } catch {
        data = textContent.text;
      }
    }

    return new Response(JSON.stringify({ text: textContent?.text, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
