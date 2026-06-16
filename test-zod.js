const { z } = require("zod");

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  price: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  image: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
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

const payload = {
  name: "Gomu Gomu Vintage Shirt",
  price: "",
  stock: "20",
  categoryId: "2",
  description: "",
  image: "some-image",
  variants: []
};

const result = updateProductSchema.safeParse(payload);
if (!result.success) {
  console.log("Validation Failed:", JSON.stringify(result.error.issues, null, 2));
} else {
  console.log("Validation Passed!");
}
