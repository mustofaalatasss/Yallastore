import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productReviews = await db.query.reviews.findMany({
      where: eq(reviews.productId, parseInt(productId)),
      orderBy: [desc(reviews.createdAt)]
    });

    return NextResponse.json(productReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, reviewerName, rating, comment } = body;

    if (!productId || !reviewerName || !rating || !comment) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const [newReview] = await db.insert(reviews).values({
      productId: parseInt(productId.toString()),
      reviewerName,
      rating: parseInt(rating.toString()),
      comment,
    }).returning();

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
