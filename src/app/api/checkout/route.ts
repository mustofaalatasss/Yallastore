import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

// Basic in-memory rate limiting (Note: In production with multiple instances, use Redis)
const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 checkouts per minute per IP

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().min(8, "Phone number too short"),
  shippingAddress: z.string().min(10, "Address too short"),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().int().positive(),
    size: z.string().optional(),
    color: z.string().optional(),
  })).min(1, "Order must contain at least one item"),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const timestamps = rateLimit.get(ip) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    validTimestamps.push(now);
    rateLimit.set(ip, validTimestamps);

    const body = await req.json();

    // 2. Validate Input with Zod
    const parsedData = checkoutSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid data", details: parsedData.error.issues }, { status: 400 });
    }

    const { customerName, customerEmail, customerPhone, shippingAddress, items } = parsedData.data;

    // 3. Fetch actual prices from DB to prevent Price Spoofing
    const productIds = items.map(item => item.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));

    // Check if all products exist
    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: "Some products in your cart are invalid or no longer exist" }, { status: 400 });
    }

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    // Calculate total securely using DB prices
    let totalAmount = 0;
    const finalItems = items.map(item => {
      const product = productMap.get(item.productId)!;
      totalAmount += product.price * item.quantity;
      return {
        ...item,
        price: product.price, // Force using DB price
        productName: product.name,
      };
    });

    const orderNumber = `YALLA-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    // 4. Save order to DB
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone,
      shippingAddress,
      totalAmount,
      status: "Pending",
    }).returning();

    // 5. Save order items
    for (const item of finalItems) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      });
    }

    // 5.5. Kirim notifikasi order ke n8n (fire-and-forget, gak boleh block checkout kalau n8n down)
    if (process.env.N8N_ORDER_WEBHOOK_URL) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000); // max nunggu 3 detik

      fetch(process.env.N8N_ORDER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: newOrder.orderNumber,
          customerName,
          email: customerEmail || null,
          phone: customerPhone,
          address: shippingAddress,
          items: finalItems.map(item => ({
            name: item.productName,
            size: item.size || "-",
            qty: item.quantity,
            price: item.price,
          })),
          total: totalAmount,
          status: "PENDING",
        }),
        signal: controller.signal,
      })
        .catch((err) => {
          console.error("Gagal kirim notifikasi n8n (order tetap tersimpan):", err);
        })
        .finally(() => clearTimeout(timeout));
    }

    // 6. Return response immediately for manual transfer
    return NextResponse.json({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
