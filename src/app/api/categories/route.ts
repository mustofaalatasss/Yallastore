import { db } from "@/db";
import { categories } from "@/db/schema";

// GET /api/categories
export async function GET() {
  try {
    const result = await db.query.categories.findMany({
      with: { products: true },
    });
    return Response.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
