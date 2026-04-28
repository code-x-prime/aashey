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
        {/* Customer Reviews - Social proof */}
        <CustomerReviews showStats={true} />

        {/* Newsletter / Royal Community CTA */}
        <NewsletterCTA />
      </main>
    </>
  );
}
