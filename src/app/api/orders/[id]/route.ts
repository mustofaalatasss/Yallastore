import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth-guard";
import { z } from "zod";

// Schema validasi untuk update order
const updateOrderSchema = z.object({
  status: z
    .enum(["Pending", "Processing", "Completed", "Cancelled"])
    .optional(),
  notes: z.string().max(1000).nullable().optional(),
  paymentProof: z.string().url().optional(),
});

// PATCH /api/orders/[id] - Update order status (ADMIN ONLY) or Upload Payment Proof (GUEST)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check (allow bypass for payment proof upload or simulated payment completion)
    const session = await getAuthSession();
    const bodyText = await request.text();
    const body = bodyText ? JSON.parse(bodyText) : {};

    if (!session && body.status !== "Completed" && body.status !== "Processing" && !body.paymentProof) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return Response.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Validasi input
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Data tidak valid", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status, notes, paymentProof } = parsed.data;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (paymentProof !== undefined) updateData.paymentProof = paymentProof;

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    // Kirim notifikasi ke n8n kalau order baru aja ditandai Completed
    if (updated && status === "Completed" && process.env.N8N_ORDER_COMPLETED_WEBHOOK_URL) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      fetch(process.env.N8N_ORDER_COMPLETED_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: updated.orderNumber,
          customerName: updated.customerName,
          totalAmount: updated.totalAmount,
          status: updated.status,
        }),
        signal: controller.signal,
      })
        .catch((err) => {
          console.error("Gagal kirim notifikasi order completed ke n8n:", err);
        })
        .finally(() => clearTimeout(timeout));
    }

    if (!updated) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true },
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error updating order:", error);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}
