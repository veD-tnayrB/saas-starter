"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import { MotionFadeIn, MotionSlideUp } from "./motion";

/**
 * Premium CTA Section with smooth hover effects
 * Invites users to get started with elegant animations
 */
export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        {/* Silver gradient overlay */}
        <div className="from-[#C0C0C0]/8 via-[#E0E0E0]/6 to-[#C0C0C0]/8 absolute inset-0 bg-gradient-to-br" />

        {/* Animated silver orbs */}
        <motion.div
          className="absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#C0C0C0]/15 via-[#E0E0E0]/10 to-[#C0C0C0]/15 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-1/4 top-1/2 h-[300px] w-[300px] -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-r from-[#E0E0E0]/10 via-[#C0C0C0]/15 to-[#E0E0E0]/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Grid pattern with silver accents */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(192,192,192,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(192,192,192,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <MaxWidthWrapper>
        <div className="relative">
          {/* Main CTA Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm sm:p-12 md:p-16"
          >
            {/* Silver background gradient */}
            <div className="from-[#C0C0C0]/4 via-[#E0E0E0]/2 to-[#C0C0C0]/4 absolute inset-0 bg-gradient-to-br" />

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/5 to-transparent"
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

            <div className="relative z-10 space-y-8 text-center">
              {/* Icon */}
              <MotionFadeIn delay={0.2}>
                <motion.div
                  className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-[#C0C0C0]/10 to-[#E0E0E0]/5 backdrop-blur-sm"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="size-8 text-primary" />
                </motion.div>
              </MotionFadeIn>

              {/* Headline */}
              <MotionSlideUp delay={0.3}>
                <h2 className="font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                  Ready to{" "}
                  <span className="text-gradient_silver">get started?</span>
                </h2>
              </MotionSlideUp>

              {/* Description */}
              <MotionSlideUp delay={0.4}>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
                  Join thousands of developers building the next generation of
                  SaaS applications. Start your journey today.
                </p>
              </MotionSlideUp>

              {/* CTA Buttons */}
              <MotionSlideUp delay={0.5}>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/pricing"
                      prefetch={true}
                      className={cn(
                        buttonVariants({ size: "lg", rounded: "full" }),
                        "bg-gradient-silver shadow-silver hover:shadow-silver-lg transition-silver hover-lift group relative overflow-hidden font-semibold text-background transition-all",
                      )}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started Free
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      {/* Shimmer effect */}
                      <motion.span
                        className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "linear",
                        }}
                      />
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

              {/* Trust indicators */}
              <MotionFadeIn delay={0.6}>
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>✓ No credit card required</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <span>✓ 14-day free trial</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <span>✓ Cancel anytime</span>
                  </div>
                </div>
              </MotionFadeIn>
            </div>
          </motion.div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
