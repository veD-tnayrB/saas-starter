"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import { testimonials } from "@/config/landing";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import { MotionFadeIn, MotionSlideUp, MotionStagger } from "./motion";

/**
 * Premium Testimonials Section with elegant carousel-like layout
 * Smooth fade-in animations and staggered appearance
 */
export function TestimonialsSection() {
  // Show first 6 testimonials
  const displayedTestimonials = testimonials.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-muted/30 py-24 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="from-[#E0E0E0]/8 to-[#E0E0E0]/8 absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-r via-[#C0C0C0]/10 blur-3xl" />
      </div>

      <MaxWidthWrapper>
        <div className="space-y-16">
          {/* Header */}
          <div className="space-y-4 text-center">
            <MotionFadeIn>
              <span className="inline-block rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                Testimonials
              </span>
            </MotionFadeIn>
            <MotionSlideUp delay={0.2}>
              <h2 className="font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                What our{" "}
                <span className="text-gradient_silver">clients are saying</span>
              </h2>
            </MotionSlideUp>
            <MotionSlideUp delay={0.3}>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Discover the glowing feedback from our delighted customers
                worldwide.
              </p>
            </MotionSlideUp>
          </div>

          {/* Testimonials Grid */}
          <MotionStagger staggerDelay={0.1}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
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
                  className="transition-silver hover:shadow-silver/10 hover-lift group relative overflow-hidden rounded-2xl border border-border bg-card p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg sm:p-8"
                >
                  {/* Quote icon */}
                  <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
                    <Quote className="size-8 text-foreground" />
                  </div>

                  {/* Author info */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-full border-2 border-border">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.job}
                      </p>
                    </div>
                  </div>

                  {/* Review text */}
                  <blockquote className="relative text-muted-foreground">
                    <p className="line-clamp-4 leading-relaxed">
                      {testimonial.review}
                    </p>
                  </blockquote>

                  {/* Silver hover gradient effect */}
                  <motion.div
                    className="transition-silver absolute inset-0 -z-10 bg-gradient-to-br from-[#C0C0C0]/0 via-[#E0E0E0]/0 to-[#C0C0C0]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5"
                    initial={false}
                  />
                </motion.div>
              ))}
            </div>
          </MotionStagger>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
