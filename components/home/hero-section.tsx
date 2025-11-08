"use client";

/**
 * Premium Hero Section
 *
 * Design Intent:
 * A refined, minimalistic hero that creates emotional impact through elegant typography,
 * subtle depth, and purposeful motion. Inspired by Linear, Vercel, and modern design
 * systems that prioritize clarity and sophistication over flashy effects.
 *
 * Animation Approach:
 * - Scroll-triggered parallax effects using Framer Motion's useScroll
 * - Staggered fade-in animations for text elements
 * - Smooth, GPU-accelerated transitions
 * - No cursor-based interactions to maintain focus on content
 *
 * Aesthetic Inspiration:
 * - Linear's clean typography and spacing
 * - Vercel's subtle depth and motion
 * - Modern minimalism with purposeful visual elements
 */
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import { MotionFadeIn, MotionSlideUp } from "./motion";

export function HeroSection() {
  // Scroll-based parallax for subtle depth
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const patternOpacity = useTransform(scrollY, [0, 300], [0.3, 0.1]);

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-background py-20 sm:min-h-screen sm:py-0">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/10" />

        {/* Animated silver gradient orbs - premium and refined */}
        <motion.div
          className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-[#C0C0C0]/15 via-[#E0E0E0]/10 to-[#C0C0C0]/15 blur-3xl"
          style={{ y: backgroundY }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-[#E0E0E0]/10 via-[#C0C0C0]/15 to-[#E0E0E0]/10 blur-3xl"
          style={{ y: backgroundY }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Subtle grid pattern with silver accents */}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(192,192,192,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(192,192,192,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"
          style={{ opacity: patternOpacity }}
        />

        {/* Geometric wave pattern with silver gradient - SVG */}
        <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden opacity-15">
          <svg
            className="h-full w-full"
            viewBox="0 0 1200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
              fill="url(#waveGradientSilver)"
              className="transition-colors duration-1000"
            />
            <defs>
              <linearGradient
                id="waveGradientSilver"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#C0C0C0" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#E0E0E0" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#C0C0C0" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content container */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10 text-center">
          {/* Badge/Announcement */}
          <MotionFadeIn delay={0.1}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/40 px-4 py-1.5 text-sm backdrop-blur-sm"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              <span className="text-muted-foreground">
                Now available — Start building today
              </span>
            </motion.div>
          </MotionFadeIn>

          {/* Main headline - refined and balanced */}
          <MotionSlideUp delay={0.2} y={30}>
            <h1 className="text-balance font-urban text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="relative inline-block">
                <span className="text-gradient_silver relative z-10">
                  SaaS Starter isn't new. It's inevitable.
                </span>
                {/* Premium silver gradient underline */}
                <motion.span
                  className="absolute -bottom-2 left-0 h-1.5 w-full bg-gradient-to-r from-transparent via-[#C0C0C0]/40 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                />
              </span>
            </h1>
          </MotionSlideUp>

          {/* Subheadline - refined spacing */}
          <MotionSlideUp delay={0.4} y={25}>
            <p className="mx-auto max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-7">
              Empower your next project with Next.js 16, Kysely, raw SQL, Neon,
              Auth.js v5, Resend, React Email, Shadcn/ui, and Stripe. All
              seamlessly integrated to accelerate your development journey.
            </p>
          </MotionSlideUp>

          {/* CTA Buttons - refined spacing and sizing */}
          <MotionSlideUp delay={0.6} y={25}>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/pricing"
                  prefetch={true}
                  className={cn(
                    buttonVariants({ size: "lg", rounded: "full" }),
                    "bg-gradient-silver hover:shadow-silver-lg transition-silver hover-lift group relative overflow-hidden text-background shadow-silver transition-all",
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    Get Started
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Premium silver shimmer effect */}
                  <motion.span
                    className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "linear",
                    }}
                  />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/docs"
                  prefetch={true}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "lg",
                      rounded: "full",
                    }),
                    "transition-silver hover-lift border border-border backdrop-blur-sm transition-all hover:border-primary/50",
                  )}
                >
                  View Documentation
                </Link>
              </motion.div>
            </div>
          </MotionSlideUp>

          {/* Trust indicators - refined typography */}
          <MotionFadeIn delay={0.8}>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">10k+</span>
                <span>Active users</span>
              </div>
              <div className="h-4 w-px bg-border/60" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">99.9%</span>
                <span>Uptime</span>
              </div>
              <div className="h-4 w-px bg-border/60" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">24/7</span>
                <span>Support</span>
              </div>
            </div>
          </MotionFadeIn>
        </div>
      </div>

      {/* Subtle scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="size-1 rounded-full bg-muted-foreground/40" />
          <div className="size-1 rounded-full bg-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
