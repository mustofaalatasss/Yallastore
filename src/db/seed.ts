import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { categories, products, user } from "./schema";

const seedData = async () => {
  console.log("Seeding database...");

  try {
    // 1. Create Admin User
    await db.insert(user).values({
      id: "admin-1",
      name: "Admin Yalla",
      email: "admin@yallastore.com",
      role: "admin",
      emailVerified: true,
    }).onConflictDoNothing();
    
    // 2. Create Categories
    const categoriesData = [
      { name: "Naruto", slug: "naruto", folderName: "Katalog Produk naruto" },
      { name: "One Piece", slug: "one-piece", folderName: "Katalog Product One Piece" },
      { name: "Jujutsu Kaisen", slug: "jujutsu-kaisen", folderName: "Katalog Produk jujutsu kaijen" },
      { name: "Demon Slayer", slug: "demon-slayer", folderName: "Katalaog Produk demon Slayer" },
    ];

    console.log("Inserting categories...");
    await db.insert(categories).values(categoriesData).onConflictDoNothing();

    // Fetch inserted categories to get their IDs
    const cats = await db.select().from(categories);
    const catMap = cats.reduce((acc, cat) => {
      acc[cat.name] = cat.id;
      return acc;
    }, {} as Record<string, number>);

    // 3. Create Products
    const productsData = [
      // Showcase Products
      { name: "Naruto Oversized Black Tee", categoryId: catMap["Naruto"], price: 249000, stock: 10, image: "/assets/Katalog Produk naruto/IMG_4606.webp", rating: 4.9, isShowcase: true },
      { name: "One Piece Wanted Poster Shirt", categoryId: catMap["One Piece"], price: 279000, stock: 10, image: "/assets/Katalog Product One Piece/IMG_4635.webp", rating: 5.0, isShowcase: true },
      { name: "Jujutsu Kaisen Dark Curse Tee", categoryId: catMap["Jujutsu Kaisen"], price: 259000, stock: 10, image: "/assets/Katalog Produk jujutsu kaijen/IMG_4677.webp", rating: 4.8, isShowcase: true },
      { name: "Demon Slayer Flame Pattern Shirt", categoryId: catMap["Demon Slayer"], price: 289000, stock: 10, image: "/assets/Katalaog Produk demon Slayer/IMG_4723.webp", rating: 4.9, isShowcase: true },
      
      // Best Sellers
      { name: "Naruto Six Paths Tee", categoryId: catMap["Naruto"], price: 269000, stock: 15, image: "/assets/Katalog Produk naruto/IMG_4627.webp", rating: 4.9, isBestSeller: true },
      { name: "Gomu Gomu Vintage Shirt", categoryId: catMap["One Piece"], price: 259000, stock: 20, image: "/assets/Katalog Product One Piece/IMG_4649.webp", rating: 4.8, isBestSeller: true },
      { name: "Gojo Satoru Infinite Void", categoryId: catMap["Jujutsu Kaisen"], price: 299000, stock: 25, image: "/assets/Katalog Produk jujutsu kaijen/IMG_4717.webp", rating: 5.0, isBestSeller: true },
      { name: "Rengoku Flame Pillar", categoryId: catMap["Demon Slayer"], price: 279000, stock: 30, image: "/assets/Katalaog Produk demon Slayer/IMG_4764.webp", rating: 4.9, isBestSeller: true },
      { name: "Akatsuki Cloud Hoodie", categoryId: catMap["Naruto"], price: 399000, stock: 10, image: "/assets/Katalog Produk naruto/IMG_4630.webp", rating: 4.9, isBestSeller: true },
      { name: "Sukuna Ryomen Curse Tee", categoryId: catMap["Jujutsu Kaisen"], price: 289000, stock: 15, image: "/assets/Katalog Produk jujutsu kaijen/IMG_4721.webp", rating: 4.8, isBestSeller: true },

      // Regular Products (Naruto)
      { name: "Kurama Mode Oversized", categoryId: catMap["Naruto"], price: 350000, stock: 24, image: "/assets/Katalog Produk naruto/IMG_4622.webp", rating: 4.9 },
      { name: "Hokage Will Edition", categoryId: catMap["Naruto"], price: 350000, stock: 15, image: "/assets/Katalog Produk naruto/IMG_4606.webp", rating: 4.8 },
      { name: "Shadow Clone Vintage", categoryId: catMap["Naruto"], price: 350000, stock: 8, image: "/assets/Katalog Produk naruto/IMG_4627.webp", rating: 4.7 },
      
      // Regular Products (One Piece)
      { name: "Straw Hat Crew Vintage", categoryId: catMap["One Piece"], price: 290000, stock: 8, image: "/assets/Katalog Product One Piece/IMG_4647.webp", rating: 4.9 },
      { name: "Pirate King Legacy", categoryId: catMap["One Piece"], price: 290000, stock: 12, image: "/assets/Katalog Product One Piece/IMG_4635.webp", rating: 4.8 },
      { name: "Grand Line Explorer", categoryId: catMap["One Piece"], price: 290000, stock: 20, image: "/assets/Katalog Product One Piece/IMG_4649.webp", rating: 4.7 },
      { name: "Yonko Territory Tee", categoryId: catMap["One Piece"], price: 290000, stock: 5, image: "/assets/Katalog Product One Piece/IMG_4663.webp", rating: 4.9 },

      // Regular Products (Jujutsu Kaisen)
      { name: "Limitless Void Edition", categoryId: catMap["Jujutsu Kaisen"], price: 320000, stock: 15, image: "/assets/Katalog Produk jujutsu kaijen/IMG_4677.webp", rating: 4.9 },
      { name: "Special Grade Curse Tee", categoryId: catMap["Jujutsu Kaisen"], price: 320000, stock: 30, image: "/assets/Katalog Produk jujutsu kaijen/IMG_4710.webp", rating: 4.8 },
      { name: "Cursed Energy Oversized", categoryId: catMap["Jujutsu Kaisen"], price: 320000, stock: 25, image: "/assets/Katalog Produk jujutsu kaijen/IMG_4717.webp", rating: 4.7 },
      
      // Regular Products (Demon Slayer)
      { name: "Hinokami Kagura Edition", categoryId: catMap["Demon Slayer"], price: 310000, stock: 42, image: "/assets/Katalaog Produk demon Slayer/IMG_4748.webp", rating: 4.9 },
      { name: "Hashira Pillar Tee", categoryId: catMap["Demon Slayer"], price: 310000, stock: 18, image: "/assets/Katalaog Produk demon Slayer/IMG_4723.webp", rating: 4.8 },
      { name: "Water Breathing Vintage", categoryId: catMap["Demon Slayer"], price: 310000, stock: 22, image: "/assets/Katalaog Produk demon Slayer/IMG_4737.webp", rating: 4.7 },
      { name: "Demon Blood Art Series", categoryId: catMap["Demon Slayer"], price: 310000, stock: 14, image: "/assets/Katalaog Produk demon Slayer/IMG_4764.webp", rating: 4.9 },
    ];

    console.log("Inserting products...");
    for (const p of productsData) {
      await db.insert(products).values({
        name: p.name,
        price: p.price,
        stock: p.stock,
        categoryId: p.categoryId,
        image: p.image,
        rating: p.rating,
        isShowcase: p.isShowcase || false,
        isBestSeller: p.isBestSeller || false,
      }).onConflictDoNothing();
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
