import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { ilike, or, desc } from "drizzle-orm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CollectionGrid from "@/components/CollectionGrid";
import CinematicBanner from "@/components/CinematicBanner";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  
  // For a simpler search, we'll fetch all and filter in JS if the query gets complex, 
  // but let's do a simple DB query first
  
  const allProducts = await db.query.products.findMany({
    with: { category: true },
    orderBy: [desc(products.createdAt)],
  });

  const filteredProducts = allProducts.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
           (p.category && p.category.name.toLowerCase().includes(q));
  });

  return (
    <main className="bg-black min-h-screen dark:text-white text-gray-900 overflow-hidden">
      <Navbar />
      <div className="pt-24 pb-12">
        <CinematicBanner />
      </div>
      
      <div className="container mx-auto px-6 md:px-12 mb-20">
        <h1 className="text-3xl md:text-5xl font-serif uppercase tracking-widest mb-4">
          {query ? `Search: ${query}` : "All Collection"}
        </h1>
        <p className="dark:text-silver text-gray-600 mb-12 font-sans">
          {filteredProducts.length} items found
        </p>

        {filteredProducts.length > 0 ? (
          <CollectionGrid products={filteredProducts} title={query ? `Search: ${query}` : "All Collection"} />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-serif dark:text-silver text-gray-600">No products found matching your search.</h2>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
