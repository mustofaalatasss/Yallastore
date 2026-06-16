import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth-guard";
import { z } from "zod";

// Schema validasi untuk update product
const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  price: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  image: z.string().nullable().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  badge: z.string().max(20).nullable().optional(),
  isShowcase: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        colorName: z.string().min(1),
        colorHex: z.string().min(1),
        image: z.string().nullable().optional(),
      })
    )
    .optional(),
});

// GET /api/products/[id] (PUBLIC — untuk halaman detail produk)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { category: true, variants: true },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PATCH /api/products/[id] (ADMIN ONLY)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await getAuthSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();

    // Validasi input
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Zod Validation Error:", parsed.error.issues);
      return Response.json(
        { error: "Data tidak valid", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, description, price, stock, categoryId, image, rating, badge, isShowcase, isBestSeller, variants } = parsed.data;

    // Update product
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (image !== undefined && image !== null) updateData.image = image;
    if (rating !== undefined) updateData.rating = rating;
    if (badge !== undefined) updateData.badge = badge;
    if (isShowcase !== undefined) updateData.isShowcase = isShowcase;
    if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();

    if (!updated) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Replace variants if provided
    if (variants !== undefined) {
      // Delete existing variants
      await db.delete(productVariants).where(eq(productVariants.productId, productId));

      // Insert new variants
      if (variants.length > 0) {
        await db.insert(productVariants).values(
          variants.map((v) => ({
            productId,
            colorName: v.colorName,
            colorHex: v.colorHex,
            image: v.image || null,
          }))
        );
      }
    }

    // Fetch with relations
    const result = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: { category: true, variants: true },
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error updating product:", error);
    return Response.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products/[id] (ADMIN ONLY)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await getAuthSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning();

    if (!deleted) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return Response.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
