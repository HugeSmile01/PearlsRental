import { HeroSection } from '@/components/layout/HeroSection';
import { FeaturedProducts } from '@/components/product/FeaturedProducts';
import { HowItWorks } from '@/components/layout/HowItWorks';
import { CategoryGrid } from '@/components/product/CategoryGrid';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <CategoryGrid />
      <FeaturedProducts />
    </>
  );
}
