import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Ambil data produk dari database (RAG Context Injection)
    let productCatalogText = "";
    try {
      const { eq } = await import("drizzle-orm");
      const { categories } = await import("@/db/schema");
      
      const allProducts = await db.select({ 
        name: products.name, 
        price: products.price, 
        image: products.image,
        categorySlug: categories.slug
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));
      
      productCatalogText = allProducts.map(p => `- ${p.name} (Harga: Rp ${p.price}, Gambar: ${p.image}, Kategori: ${p.categorySlug || ''})`).join('\n');
    } catch (e) {
      console.error("Gagal mengambil data produk dari DB:", e);
      // Lanjut tanpa konteks jika gagal
    }

    // 2. Suntikkan (Inject) Katalog ke dalam pesan secara rahasia
    const enrichedMessage = `
---
[SECRET SYSTEM INFO - DO NOT READ TO CUSTOMER]
Here is the list of all Yalla Store products and their image links:
${productCatalogText || "(Failed to load catalog)"}
Use the most relevant image link above when creating a Product Card JSON.
CRITICAL INSTRUCTION: You MUST reply in the EXACT SAME LANGUAGE as the user's message below! If the user writes in English, you MUST reply entirely in English. Jika user menulis bahasa Indonesia, balas pakai bahasa Indonesia.
---

[USER MESSAGE]:
${message}
`;

    // URL Webhook n8n rahasia Mas
    const n8nWebhookUrl = "https://n8n.portofolio-mustofa.my.id/webhook/d6fd1f31-7dc1-47e9-bf17-120c1ce551ab";

    // Jembatan: Next.js mengirimkan pesan ke n8n di belakang layar
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: enrichedMessage, sessionId }),
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
