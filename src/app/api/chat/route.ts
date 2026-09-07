// app/api/chat/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message: string = body?.message?.toString() ?? '';
    // Terima keduanya: cultureContext (baru) atau artifactContext (lama)
    const ctx = body?.cultureContext ?? body?.artifactContext ?? {};

    if (!message.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY in environment');
      return Response.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // Rakitan prompt yang konsisten dengan "culture"
    // (pakai fallback kosong biar gak undefined)
    const prompt = [
      'Anda adalah pemandu virtual budaya Indonesia.',
      'Jawab ringkas, akurat, dan sopan dalam bahasa Indonesia.',
      '',
      'Konteks budaya:',
      `• Judul/Nama: ${ctx.title ?? ''}`,
      `• Kategori: ${ctx.category ?? ''}`,
      `• Provinsi/Region: ${ctx.province ?? ctx.region ?? ''}`,
      `• Slug: ${ctx.slug ?? ''}`,
      `• Deskripsi: ${ctx.description ?? ctx.content ?? ''}`,
      '',
      `Pertanyaan: ${message}`,
    ].join('\n');

    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash';
    const liteModel = process.env.GEMINI_MODEL_LITE || 'gemini-3.1-flash-lite';
    const models = [...new Set([primaryModel, liteModel])];

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    let data: any = null;
    let usedModel = primaryModel;
    let lastDetail = '';

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      data = await resp.json();

      if (resp.ok) {
        usedModel = model;
        break;
      }

      lastDetail =
        data?.error?.message ||
        data?.error?.status ||
        `HTTP ${resp.status} ${resp.statusText}`;
      console.error(`Gemini API error (${model}):`, lastDetail, 'payload:', data);
      data = null;
    }

    if (!data) {
      return Response.json(
        { error: `Gemini API error: ${lastDetail || 'all models failed'}` },
        { status: 502 }
      );
    }

    // Robust extraction: join semua parts.text
    const parts: string[] =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
        ?.filter(Boolean) ?? [];

    const aiResponse =
      parts.join('\n').trim() ||
      'Maaf, saya tidak dapat memberikan jawaban saat ini.';

    return Response.json({ response: aiResponse, model: usedModel });
  } catch (err: any) {
    console.error('Chat API error:', err?.stack || err?.message || err);
    return Response.json(
      { error: 'Terjadi kesalahan dalam memproses permintaan Anda.' },
      { status: 500 }
    );
  }
}
