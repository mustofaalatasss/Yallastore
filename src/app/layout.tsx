import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CartSidebar from "@/components/CartSidebar";
import CheckoutModal from "@/components/CheckoutModal";
import ScrollProgress from "@/components/ScrollProgress";
import ParticleBackground from "@/components/ParticleBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FloatingChat } from "@/components/FloatingChat";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yalla Anime Streetwear | Premium Collection",
  description: "Wear Your Favorite Anime With Style. Luxury dark theme anime streetwear featuring Naruto, One Piece, Jujutsu Kaisen, and Demon Slayer.",
  keywords: ["anime streetwear", "kaos anime", "baju anime premium", "yalla store", "oversize anime", "baju jujutsu kaisen", "kaos one piece", "streetwear lokal"],
  openGraph: {
    title: "Yalla Anime Streetwear | Premium Collection",
    description: "Wear Your Favorite Anime With Style. Luxury dark theme anime streetwear.",
    url: "https://yallastore.my.id",
    siteName: "Yalla Store",
    locale: "id_ID",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "w_2NwEJxExnJtR7meRXSNStNaLuN25GA4qsr_7XL5_Q",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ScrollProgress />
          <ParticleBackground />
          
          {children}
          <CartSidebar />
          <CheckoutModal />
          <FloatingChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
