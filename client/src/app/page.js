import { ShopByCategory } from "@/components/sections/ShopByCategory";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { BestSellers } from "@/components/sections/BestSellers";
import { NewArrivals } from "@/components/sections/NewArrivals";
import CategoriesCarousel from "@/components/sections/CategoriesCarousel";
import HeroSection from "@/components/sections/HeroSection";
import { CustomerReviews } from "@/components/sections/CustomerReviews";
import { FlashSaleSection } from "@/components/sections/FlashSaleSection";
import { TrendingProducts } from "@/components/sections/TrendingProducts";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";

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



        {/* Featured Products - Hero products */}
        <FeaturedProducts />

        {/* Best Sellers - Popular items */}
        <BestSellers />

        {/* Shop By Category - Visual grid */}
        <ShopByCategory />

        {/* Trending Products */}
        <TrendingProducts />

        {/* New Arrivals - Latest products */}
        <NewArrivals />

        {/* Customer Reviews - Social proof */}
        <CustomerReviews showStats={true} />

        {/* Newsletter / Royal Community CTA */}
        <NewsletterCTA />
      </main>
    </>
  );
}
