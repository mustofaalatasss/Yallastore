import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

function getTitleBySlug(slug: string) {
  if (slug === "one-piece") return "One Piece";
  if (slug === "jujutsu-kaisen") return "Jujutsu Kaisen";
  if (slug === "demon-slayer") return "Demon Slayer";
  return slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default async function CollectionPage({ params }: { params: Promise<{ anime: string }> }) {
  const resolvedParams = await params;
  const animeSlug = resolvedParams.anime;
  const title = getTitleBySlug(animeSlug);
  const categoryData = await db.query.categories.findFirst({
    where: ilike(categories.name, title)
  });

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-serif mb-4">Collection Not Found</h1>
          <Link href="/" className="text-primary hover:underline font-sans uppercase tracking-widest text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const categoryProducts = await db.query.products.findMany({
    where: eq(products.categoryId, categoryData.id),
    with: { category: true, variants: true }
  });

  return (
    <main className="bg-[#050505] min-h-screen text-white pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <Link href="/#collection" className="inline-flex items-center gap-2 text-silver hover:text-white transition-colors uppercase tracking-widest text-xs font-sans mb-12">
          <ArrowLeft size={16} /> Back to Collection
        </Link>

        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-serif mb-4 uppercase tracking-wider">{title} Collection</h1>
          <div className="w-24 h-1 bg-primary mb-6"></div>
          <p className="text-silver font-sans max-w-2xl text-sm md:text-base leading-relaxed">
            Explore our exclusive {title} premium streetwear collection. Each piece is crafted with high-quality fabric and intricate designs to represent your favorite characters.
          </p>
        </div>

        <CollectionGrid products={categoryProducts} title={title} />
      </div>
    </main>
  );
}
