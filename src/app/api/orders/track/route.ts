import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get("orderId");
    const phone = searchParams.get("phone");

    if (!orderIdParam || !phone) {
      return NextResponse.json({ error: "Order ID and phone number are required" }, { status: 400 });
    }

    const orderRecord = await db.query.orders.findFirst({
      where: and(
        eq(orders.orderNumber, orderIdParam),
        eq(orders.customerPhone, phone)
      ),
      with: {
        items: {
          with: {
            product: true
          }
        }
      }
    });

    if (!orderRecord) {
      return NextResponse.json({ error: "Order not found. Please verify your ID and WhatsApp number." }, { status: 404 });
    }

    return NextResponse.json(orderRecord);
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
