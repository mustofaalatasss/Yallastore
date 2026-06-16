import { config } from "dotenv";
config({ path: ".env.local" });

import { auth } from "../lib/auth";
import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

async function setupAdmin() {
  try {
    console.log("Setting up admin account...");
    const email = process.env.ADMIN_EMAIL || "admin@yallastore.com";
    const password = process.env.ADMIN_PASSWORD || "yallapassword123";
    const name = "Admin Yalla";

    // Delete existing admin from seed script so better-auth can create it cleanly with password
    await db.delete(user).where(eq(user.email, email));

    // Call better-auth server API to create user with password
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: new Headers()
    });

    console.log("Admin account setup successful!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error: any) {
    console.error("Failed to setup admin:", error?.message || error);
    process.exit(1);
  }
}

setupAdmin();
