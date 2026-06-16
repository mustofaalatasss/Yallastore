import Preloader from "@/components/Preloader";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import ProductShowcase from "@/components/ProductShowcase";
import CinematicBanner from "@/components/CinematicBanner";
import AnimeSeriesScroll from "@/components/AnimeSeriesScroll";
import BestSeller from "@/components/BestSeller";
import Testimonial from "@/components/Testimonial";
import Footer from "@/components/Footer";

import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch real data from DB
  const allProds = await db.query.products.findMany({
    with: { category: true },
    orderBy: [desc(products.createdAt)],
  });

  const showcaseProducts = allProds.filter(p => p.isShowcase).slice(0, 4);
  const bestSellerProducts = allProds.filter(p => p.isBestSeller || p.badge === 'BEST SELLER').slice(0, 6);

  // Fallbacks if no data is marked
  const finalShowcase = showcaseProducts.length > 0 ? showcaseProducts : allProds.slice(0, 4);
  const finalBestSellers = bestSellerProducts.length > 0 ? bestSellerProducts : allProds.slice(0, 6);

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden">
      <Preloader />
      <Navbar />
      <HeroSection />
      <FeaturedCategories />
      <CinematicBanner />
      <ProductShowcase products={finalShowcase} />
      <AnimeSeriesScroll />
      <BestSeller products={finalBestSellers} />
      <Testimonial />
      <Footer />
    </main>
  );
}
