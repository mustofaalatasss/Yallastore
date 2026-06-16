import { db } from "@/db";
import { products, orders, categories } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth-guard";

// GET /api/dashboard - Dashboard statistics (ADMIN ONLY)
export async function GET() {
  try {
    // Auth check — dashboard data is sensitive
    const session = await getAuthSession();
    if (!session) return unauthorizedResponse();

    // Total products & stock
    const productStats = await db
      .select({
        totalProducts: sql<number>`count(*)`,
        totalStock: sql<number>`coalesce(sum(${products.stock}), 0)`,
      })
      .from(products);

    // Total orders & revenue
    const orderStats = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
      })
      .from(orders);

    // Orders by status
    const ordersByStatus = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .groupBy(orders.status);

    // Recent orders
    const recentOrders = await db.query.orders.findMany({
      with: { items: true },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit: 5,
    });

    // Categories with product count
    const categoryStats = await db
      .select({
        name: categories.name,
        productCount: sql<number>`count(${products.id})`,
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.name);

    // Revenue by date (Last 30 days)
    const revenueByDateRaw = await db
      .select({
        date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<number>`sum(${orders.totalAmount})`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= NOW() - INTERVAL '30 days'`)
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);


    return Response.json({
      totalProducts: Number(productStats[0]?.totalProducts || 0),
      totalStock: Number(productStats[0]?.totalStock || 0),
      totalOrders: Number(orderStats[0]?.totalOrders || 0),
      totalRevenue: Number(orderStats[0]?.totalRevenue || 0),
      ordersByStatus: Object.fromEntries(
        ordersByStatus.map((s) => [s.status, Number(s.count)])
      ),
      recentOrders,
      categoryStats,
      revenueByDate: revenueByDateRaw.map(r => ({ date: r.date, revenue: Number(r.revenue || 0) })),

    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return Response.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
