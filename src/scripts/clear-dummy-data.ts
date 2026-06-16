import { db } from "../db";
import { orders, orderItems, reviews } from "../db/schema";
import { sql } from "drizzle-orm";

async function clearDummyData() {
  console.log("Cleaning up dummy data from database...");
  try {
    // Delete all records from reviews, orderItems, and orders
    // orderItems and reviews are linked to orders and products. 
    // We can just delete orders and reviews, cascade will handle orderItems if set, 
    // but Drizzle delete() works too.
    
    await db.delete(reviews);
    console.log("✅ Cleared reviews table");

    await db.delete(orderItems);
    console.log("✅ Cleared order items table");

    await db.delete(orders);
    console.log("✅ Cleared orders table");

    // Optional: Reset sequence if needed
    // await db.execute(sql`ALTER SEQUENCE orders_id_seq RESTART WITH 1`);

    console.log("✨ All dummy checkout data has been successfully deleted!");
  } catch (error) {
    console.error("❌ Error cleaning up database:", error);
  } finally {
    process.exit(0);
  }
}

clearDummyData();
