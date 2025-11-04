"use client";

import { motion } from "framer-motion";

import { features } from "@/config/landing";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import { MotionFadeIn, MotionSlideUp, MotionStagger } from "./motion";

/**
 * Premium Features Section with smooth scroll animations
 * Cards with parallax effects and hover interactions
 */
export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="from-[#C0C0C0]/8 via-[#E0E0E0]/6 to-[#C0C0C0]/8 absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r blur-3xl" />
      </div>

      <MaxWidthWrapper>
        <div className="space-y-16">
          {/* Header */}
          <div className="space-y-4 text-center">
            <MotionFadeIn>
              <span className="inline-block rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                Features
              </span>
            </MotionFadeIn>
            <MotionSlideUp delay={0.2}>
              <h2 className="font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Everything you need to{" "}
                <span className="text-gradient_silver">build faster</span>
              </h2>
            </MotionSlideUp>
            <MotionSlideUp delay={0.3}>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Discover all the powerful features that accelerate your
                development and help you ship products faster.
              </p>
            </MotionSlideUp>
          </div>

          {/* Features Grid */}
          <MotionStagger staggerDelay={0.1}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = Icons[feature.icon || "nextjs"];
                return (
                  <motion.div
                    key={feature.title}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                    whileHover={{ y: -4 }}
                    className="transition-silver hover-lift group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-silver/10 sm:p-8"
                  >
                    {/* Silver gradient background on hover */}
                    <div className="transition-silver group-hover:opacity-8 absolute inset-0 -z-10 bg-gradient-to-br from-[#C0C0C0]/0 via-[#E0E0E0]/0 to-[#C0C0C0]/0 opacity-0 transition-opacity duration-500" />

                    {/* Animated silver gradient orb */}
                    <motion.div
                      className="transition-silver absolute -right-1/4 -top-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-[#C0C0C0]/15 via-[#E0E0E0]/10 to-[#C0C0C0]/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Icon */}
                    <div className="relative mb-6">
                      <motion.div
                        className="relative flex size-14 items-center justify-center rounded-xl border border-border/50 bg-muted/50 shadow-sm backdrop-blur-sm"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="size-6 text-foreground" />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="relative space-y-3">
                      <h3 className="text-xl font-semibold tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </MotionStagger>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
