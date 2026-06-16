import { db } from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth-guard";

// GET /api/revenue - Detailed revenue analytics (ADMIN ONLY)
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // 1. Total revenue for the period
    const totalRevenueQuery = await db
      .select({
        total: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(days.toString())} days' AND ${orders.status} = 'Completed'`);
      
    // 2. Revenue by date for charts
    const revenueByDateRaw = await db
      .select({
        date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<number>`sum(${orders.totalAmount})`,
        ordersCount: sql<number>`count(*)`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(days.toString())} days' AND ${orders.status} = 'Completed'`)
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

    // 3. Top selling products by revenue
    const topProductsRaw = await db
      .select({
        productId: orderItems.productId,
        productName: orderItems.productName,
        totalSold: sql<number>`sum(${orderItems.quantity})`,
        revenueGenerated: sql<number>`sum(${orderItems.quantity} * ${orderItems.price})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(sql`${orders.createdAt} >= NOW() - INTERVAL '${sql.raw(days.toString())} days' AND ${orders.status} = 'Completed'`)
      .groupBy(orderItems.productId, orderItems.productName)
      .orderBy(desc(sql`sum(${orderItems.quantity} * ${orderItems.price})`))
      .limit(10);

    return Response.json({
      totalRevenue: Number(totalRevenueQuery[0]?.total || 0),
      revenueByDate: revenueByDateRaw.map((r) => ({
        date: r.date,
        revenue: Number(r.revenue || 0),
        ordersCount: Number(r.ordersCount || 0),
      })),
      topProducts: topProductsRaw.map((p) => ({
        ...p,
        totalSold: Number(p.totalSold || 0),
        revenueGenerated: Number(p.revenueGenerated || 0),
      })),
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    return Response.json({ error: "Failed to fetch revenue analytics" }, { status: 500 });
  }
}
