import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // URL Webhook n8n rahasia Mas
    const n8nWebhookUrl = "https://mustofaalatas.app.n8n.cloud/webhook/d6fd1f31-7dc1-47e9-bf17-120c1ce551ab";

    // Jembatan: Next.js mengirimkan pesan ke n8n di belakang layar
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!n8nResponse.ok) {
      console.error("Gagal menghubungi n8n:", n8nResponse.statusText);
      return NextResponse.json(
        { error: "AI sedang sibuk atau offline" },
        { status: 502 }
      );
    }

    // Mengambil jawaban dari n8n dan mengirimkannya ke frontend (FloatingChat)
    let data;
    const contentType = n8nResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await n8nResponse.json();
    } else {
      data = { reply: await n8nResponse.text() };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Server Error di Chat API:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
