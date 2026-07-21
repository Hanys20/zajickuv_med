import Hero from '@/components/sections/Hero';
import StoryTeaser from '@/components/sections/StoryTeaser';
import WhyUs from '@/components/sections/WhyUs';
import ProductsPricing from '@/components/sections/ProductsPricing';
import News from '@/components/sections/News';
import Reviews from '@/components/sections/Reviews';
import FaqTeaser from '@/components/sections/FaqTeaser';
import ContactSection from '@/components/sections/ContactSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <StoryTeaser />
      <WhyUs />
      <ProductsPricing />
      <News />
      <Reviews />
      <FaqTeaser />
      <ContactSection />
    </>
  );
}
