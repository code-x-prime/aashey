import { ShopByCategory } from "@/components/sections/ShopByCategory";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { BestSellers } from "@/components/sections/BestSellers";
import { NewArrivals } from "@/components/sections/NewArrivals";
import HeroSection from "@/components/sections/HeroSection";
import { CustomerReviews } from "@/components/sections/CustomerReviews";
import { FlashSaleSection } from "@/components/sections/FlashSaleSection";
import { TrendingProducts } from "@/components/sections/TrendingProducts";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";
import BannerCarousel from "@/components/sections/BannerCarousel";
import BrandCarousel from "@/components/sections/BrandCarousel";
import AasheyFAQSection from "@/components/sections/AasheyFAQSection";
import VideoCarousel from "@/components/sections/VideoCarousel";

export const metadata = {
  title: "AASHEY | Pure A2 Cow Ghee — Traditionally Bilona Crafted",
  description: "Experience the purest A2 Cow Ghee, crafted using the traditional Bilona method. 100% pure, lab tested, no preservatives. Free shipping on orders above ₹999.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <main>
        {/* Categories Carousel - Quick navigation */}
        {/* Hero Section with prominent CTA */}
        <HeroSection />

        {/* <CategoriesCarousel /> */}

        {/* Flash Sale - If active */}
        <FlashSaleSection />
        <BrandCarousel tag="TOP" title="TOP BRANDS" />
        {/* Featured Products - Hero products */}
        <FeaturedProducts />

        {/* Best Sellers - Popular items */}
        <BestSellers />

        {/* Shop By Category - Visual grid */}
        <ShopByCategory />

        {/* Trending Products */}
        <TrendingProducts />
        <BrandCarousel tag="HOT" title="HOT BRANDS" />
        <BannerCarousel />

        {/* New Arrivals - Latest products */}
        <NewArrivals />

        <BrandCarousel tag="NEW" title="NEW BRANDS" />
        {/* Video Carousel - above reviews */}
        <VideoCarousel />

        {/* Customer Reviews - Social proof */}
        <CustomerReviews showStats={true} />

        <AasheyFAQSection />

        {/* Newsletter / Royal Community CTA */}
        <NewsletterCTA />
      </main>
    </>
  );
}

