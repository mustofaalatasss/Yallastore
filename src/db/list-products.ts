import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { products, categories } from "./schema";

async function listProducts() {
  const allProds = await db.query.products.findMany({
    with: { category: true },
  });
  
  console.log(`\n=== Total Products in DB: ${allProds.length} ===\n`);
  
  allProds.forEach((p, i) => {
    console.log(`${i+1}. [ID:${p.id}] "${p.name}" | Category: ${p.category?.name || 'NONE'} | Price: ${p.price} | Showcase: ${p.isShowcase} | BestSeller: ${p.isBestSeller} | Image: ${p.image?.substring(0, 60)}...`);
  });

  const cats = await db.select().from(categories);
  console.log(`\n=== Categories (${cats.length}) ===`);
  cats.forEach(c => console.log(`  - [ID:${c.id}] ${c.name} (${c.slug})`));

  process.exit(0);
}

listProducts();
