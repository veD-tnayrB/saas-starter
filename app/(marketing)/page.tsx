import {
  CTASection,
  FeaturesSection,
  HeroSection,
  TestimonialsSection,
} from "@/components/home";

/**
 * Premium Landing Page
 *
 * A complete redesign with smooth animations, elegant transitions,
 * and a modern aesthetic inspired by Linear, Vercel, and Superhuman.
 *
 * Features:
 * - Full viewport hero with animated gradient background
 * - 3D parallax mouse interaction on hero
 * - Smooth scroll-triggered animations
 * - Elegant card designs with hover effects
 * - Premium color gradients (purple/blue theme)
 * - Fully responsive design
 */
export default function IndexPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
