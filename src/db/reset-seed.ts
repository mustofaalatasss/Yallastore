import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { categories, products, productVariants } from "./schema";
import { sql } from "drizzle-orm";

async function resetAndSeed() {
  console.log("🧹 Membersihkan semua produk dari database...\n");

  // Delete all product variants first (foreign key constraint)
  await db.delete(productVariants);
  // Delete all products
  await db.delete(products);
  // Delete all categories
  await db.delete(categories);

  // Reset sequences
  await db.execute(sql`ALTER SEQUENCE products_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE categories_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE product_variants_id_seq RESTART WITH 1`);

  console.log("✅ Database dibersihkan!\n");

  // ========================================
  // 1. Create Categories
  // ========================================
  const categoriesData = [
    { name: "Naruto", slug: "naruto", folderName: "Katalog Produk naruto" },
    { name: "One Piece", slug: "one-piece", folderName: "Katalog Product One Piece" },
    { name: "Jujutsu Kaisen", slug: "jujutsu-kaisen", folderName: "Katalog Produk jujutsu kaijen" },
    { name: "Demon Slayer", slug: "demon-slayer", folderName: "Katalaog Produk demon Slayer" },
  ];

  console.log("📂 Membuat kategori...");
  await db.insert(categories).values(categoriesData);

  const cats = await db.select().from(categories);
  const catMap = cats.reduce((acc, cat) => {
    acc[cat.name] = cat.id;
    return acc;
  }, {} as Record<string, number>);

  console.log("  ✓ Kategori dibuat:", cats.map(c => c.name).join(", "));

  // ========================================
  // 2. Create Products — TANPA DUPLIKAT
  // Setiap gambar hanya dipakai 1 kali
  // ========================================
  const productsData = [
    // === NARUTO (4 produk, 4 gambar unik) ===
    { 
      name: "Kurama Mode Oversized", 
      categoryId: catMap["Naruto"], 
      price: 350000, stock: 24, 
      image: "/assets/Katalog Produk naruto/IMG_4622.webp", 
      rating: 4.9, 
      isShowcase: true, isBestSeller: false 
    },
    { 
      name: "Hokage Will Edition", 
      categoryId: catMap["Naruto"], 
      price: 249000, stock: 15, 
      image: "/assets/Katalog Produk naruto/IMG_4606.webp", 
      rating: 4.8, 
      isShowcase: false, isBestSeller: true 
    },
    { 
      name: "Shadow Clone Vintage", 
      categoryId: catMap["Naruto"], 
      price: 269000, stock: 8, 
      image: "/assets/Katalog Produk naruto/IMG_4627.webp", 
      rating: 4.7, 
      isShowcase: false, isBestSeller: false 
    },
    { 
      name: "Akatsuki Cloud Hoodie", 
      categoryId: catMap["Naruto"], 
      price: 399000, stock: 10, 
      image: "/assets/Katalog Produk naruto/IMG_4630.webp", 
      rating: 4.9, 
      isShowcase: false, isBestSeller: true 
    },

    // === ONE PIECE (4 produk, 4 gambar unik) ===
    { 
      name: "Straw Hat Crew Vintage", 
      categoryId: catMap["One Piece"], 
      price: 290000, stock: 8, 
      image: "/assets/Katalog Product One Piece/IMG_4647.webp", 
      rating: 4.9, 
      isShowcase: true, isBestSeller: false 
    },
    { 
      name: "Pirate King Legacy", 
      categoryId: catMap["One Piece"], 
      price: 279000, stock: 12, 
      image: "/assets/Katalog Product One Piece/IMG_4635.webp", 
      rating: 4.8, 
      isShowcase: false, isBestSeller: true 
    },
    { 
      name: "Grand Line Explorer", 
      categoryId: catMap["One Piece"], 
      price: 259000, stock: 20, 
      image: "/assets/Katalog Product One Piece/IMG_4649.webp", 
      rating: 4.7, 
      isShowcase: false, isBestSeller: false 
    },
    { 
      name: "Yonko Territory Tee", 
      categoryId: catMap["One Piece"], 
      price: 290000, stock: 5, 
      image: "/assets/Katalog Product One Piece/IMG_4663.webp", 
      rating: 4.9, 
      isShowcase: false, isBestSeller: false 
    },

    // === JUJUTSU KAISEN (4 produk, 4 gambar unik) ===
    { 
      name: "Gojo Satoru Infinite Void", 
      categoryId: catMap["Jujutsu Kaisen"], 
      price: 299000, stock: 25, 
      image: "/assets/Katalog Produk jujutsu kaijen/IMG_4677.webp", 
      rating: 5.0, 
      isShowcase: true, isBestSeller: true 
    },
    { 
      name: "Special Grade Curse Tee", 
      categoryId: catMap["Jujutsu Kaisen"], 
      price: 320000, stock: 30, 
      image: "/assets/Katalog Produk jujutsu kaijen/IMG_4710.webp", 
      rating: 4.8, 
      isShowcase: false, isBestSeller: false 
    },
    { 
      name: "Cursed Energy Oversized", 
      categoryId: catMap["Jujutsu Kaisen"], 
      price: 289000, stock: 15, 
      image: "/assets/Katalog Produk jujutsu kaijen/IMG_4717.webp", 
      rating: 4.7, 
      isShowcase: false, isBestSeller: false 
    },
    { 
      name: "Sukuna Ryomen Curse Tee", 
      categoryId: catMap["Jujutsu Kaisen"], 
      price: 289000, stock: 15, 
      image: "/assets/Katalog Produk jujutsu kaijen/IMG_4721.webp", 
      rating: 4.8, 
      isShowcase: false, isBestSeller: false 
    },

    // === DEMON SLAYER (4 produk, 4 gambar unik) ===
    { 
      name: "Hinokami Kagura Edition", 
      categoryId: catMap["Demon Slayer"], 
      price: 310000, stock: 42, 
      image: "/assets/Katalaog Produk demon Slayer/IMG_4748.webp", 
      rating: 4.9, 
      isShowcase: true, isBestSeller: false 
    },
    { 
      name: "Hashira Pillar Tee", 
      categoryId: catMap["Demon Slayer"], 
      price: 279000, stock: 18, 
      image: "/assets/Katalaog Produk demon Slayer/IMG_4723.webp", 
      rating: 4.8, 
      isShowcase: false, isBestSeller: true 
    },
    { 
      name: "Water Breathing Vintage", 
      categoryId: catMap["Demon Slayer"], 
      price: 310000, stock: 22, 
      image: "/assets/Katalaog Produk demon Slayer/IMG_4737.webp", 
      rating: 4.7, 
      isShowcase: false, isBestSeller: false 
    },
    { 
      name: "Demon Blood Art Series", 
      categoryId: catMap["Demon Slayer"], 
      price: 310000, stock: 14, 
      image: "/assets/Katalaog Produk demon Slayer/IMG_4764.webp", 
      rating: 4.9, 
      isShowcase: false, isBestSeller: false 
    },
  ];

  console.log(`\n👕 Memasukkan ${productsData.length} produk (tanpa duplikat)...`);
  for (const p of productsData) {
    await db.insert(products).values(p);
  }

  // Verify
  const allProds = await db.select().from(products);
  console.log(`  ✓ ${allProds.length} produk berhasil dimasukkan`);
  
  const showcaseCount = allProds.filter(p => p.isShowcase).length;
  const bestSellerCount = allProds.filter(p => p.isBestSeller).length;
  console.log(`  - Showcase: ${showcaseCount} produk (1 per kategori)`);
  console.log(`  - Best Seller: ${bestSellerCount} produk`);
  console.log(`  - Total: ${allProds.length} produk (4 per kategori, 16 total)`);

  console.log("\n🎉 Selesai! Database sudah bersih.");
  process.exit(0);
}

resetAndSeed().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
