import { db } from "@/db";
import { products, productVariants, categories } from "@/db/schema";
import { eq, ilike, and, sql, desc } from "drizzle-orm";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth-guard";
import { z } from "zod";

// Schema validasi untuk create product
const createProductSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(200),
  description: z.string().max(2000).nullable().optional(),
  price: z.coerce.number().int().positive("Harga harus lebih dari 0"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  image: z.string().min(1, "Gambar wajib diisi"),
  rating: z.coerce.number().min(0).max(5).optional().default(4.9),
  badge: z.string().max(20).nullable().optional(),
  isShowcase: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  variants: z
    .array(
      z.object({
        colorName: z.string().min(1),
        colorHex: z.string().min(1),
        image: z.string().nullable().optional(),
      })
    )
    .optional()
    .default([]),
});

// GET /api/products - Fetch all products (PUBLIC — tidak perlu auth)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const showcase = searchParams.get("showcase");
    const bestSeller = searchParams.get("bestSeller");

    const conditions = [];
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }
    if (category && category !== "All Categories") {
      const catId = parseInt(category);
      if (!isNaN(catId)) {
        conditions.push(eq(products.categoryId, catId));
      }
    }
    if (showcase === "true") {
      conditions.push(eq(products.isShowcase, true));
    }
    if (bestSeller === "true") {
      conditions.push(eq(products.isBestSeller, true));
    }

    const result = await db.query.products.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        category: true,
        variants: true,
      },
      orderBy: [desc(products.createdAt)],
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products - Create a new product (ADMIN ONLY)
export async function POST(request: Request) {
  try {
    // Auth check
    const session = await getAuthSession();
    if (!session) return unauthorizedResponse();

    const body = await request.json();

    // Validasi input
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Data tidak valid", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, description, price, stock, categoryId, image, rating, badge, isShowcase, isBestSeller, variants } = parsed.data;

    // Insert product
    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        description: description || null,
        price,
        stock,
        categoryId: categoryId || null,
        image,
        rating,
        badge: badge || null,
        isShowcase,
        isBestSeller,
      })
      .returning();

    // Insert variants if provided
    if (variants && variants.length > 0) {
      await db.insert(productVariants).values(
        variants.map((v) => ({
          productId: newProduct.id,
          colorName: v.colorName,
          colorHex: v.colorHex,
          image: v.image || null,
        }))
      );
    }

    // Fetch with relations
    const result = await db.query.products.findFirst({
      where: eq(products.id, newProduct.id),
      with: { category: true, variants: true },
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return Response.json({ error: "Failed to create product" }, { status: 500 });
  }
}
