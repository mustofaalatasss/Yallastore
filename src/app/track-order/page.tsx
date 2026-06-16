import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackOrderClient from "./TrackOrderClient";
import { Suspense } from "react";

export const metadata = {
  title: "Track Your Order - Yalla Store",
  description: "Track the status of your Yalla Store order.",
};

export default function TrackOrderPage() {
  return (
    <main className="bg-black min-h-screen text-white pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-center uppercase tracking-widest">Track Order</h1>
        <p className="text-silver text-center font-sans mb-12 max-w-xl mx-auto">
          Enter your Order ID and the WhatsApp number you used during checkout to see the latest status of your shipment.
        </p>
        
        <Suspense fallback={<div className="text-center text-silver">Loading...</div>}>
          <TrackOrderClient />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
