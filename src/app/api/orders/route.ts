import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth-guard";
import { z } from "zod";

// Schema validasi untuk create order
const createOrderSchema = z.object({
  customerName: z.string().min(1, "Nama pelanggan wajib diisi").max(200),
  customerEmail: z.string().email("Email tidak valid").nullable().optional(),
  customerPhone: z.string().max(20).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  status: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive().nullable().optional(),
        productName: z.string().min(1),
        quantity: z.number().int().positive("Jumlah harus lebih dari 0"),
        price: z.number().int().min(0),
        size: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
      })
    )
    .min(1, "Minimal 1 item dalam order"),
});

// GET /api/orders (ADMIN ONLY)
export async function GET(request: Request) {
  try {
    // Auth check
    const session = await getAuthSession();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const conditions = [];
    if (status && status !== "All") {
      conditions.push(eq(orders.status, status));
    }
    if (search) {
      conditions.push(ilike(orders.orderNumber, `%${search}%`));
    }

    const result = await db.query.orders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        items: true,
      },
      orderBy: [desc(orders.createdAt)],
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders - Create a new order (PUBLIC — untuk customer checkout)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi input
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Data tidak valid", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { customerName, customerEmail, customerPhone, items, notes, status } = parsed.data;

    // Calculate total from validated data
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Generate order number
    const count = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const orderNum = `#ORD-${String(Number(count[0].count) + 1).padStart(3, "0")}`;

    // Insert order
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber: orderNum,
        customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        totalAmount,
        status: status || "Pending",
        notes: notes || null,
      })
      .returning();

    // Insert order items
    if (items && items.length > 0) {
      await db.insert(orderItems).values(
        items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId || null,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          size: item.size || null,
          color: item.color || null,
        }))
      );
    }

    const result = await db.query.orders.findFirst({
      where: eq(orders.id, newOrder.id),
      with: { items: true },
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
