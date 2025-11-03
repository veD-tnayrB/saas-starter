"use client";

import * as React from "react";
import {
  motion,
  MotionProps,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Reusable motion variants for consistent animations
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1], // Custom easing for smooth motion
    },
  },
};

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Motion Fade In Component
 * Fades in content as it enters the viewport
 */
interface MotionFadeInProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MotionFadeIn({
  children,
  className,
  delay = 0,
  ...props
}: MotionFadeInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeIn}
      transition={{ delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Motion Slide Up Component
 * Slides content up as it enters the viewport
 */
interface MotionSlideUpProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function MotionSlideUp({
  children,
  className,
  delay = 0,
  y = 20,
  ...props
}: MotionSlideUpProps) {
  const customVariants: Variants = {
    hidden: {
      opacity: 0,
      y,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={customVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Motion Scale In Component
 * Scales content in as it enters the viewport
 */
interface MotionScaleInProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MotionScaleIn({
  children,
  className,
  delay = 0,
  ...props
}: MotionScaleInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={scaleIn}
      transition={{ delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Motion Stagger Container
 * Staggers children animations
 */
interface MotionStaggerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function MotionStagger({
  children,
  className,
  staggerDelay = 0.1,
  ...props
}: MotionStaggerProps) {
  const customVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={customVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Motion Parallax Component
 * Creates parallax effect on scroll
 * Note: For complex parallax, use useScroll hook from framer-motion
 */
interface MotionParallaxProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function MotionParallax({
  children,
  className,
  speed = 0.5,
  ...props
}: MotionParallaxProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div className={cn(className)} style={{ y }} {...props}>
      {children}
    </motion.div>
  );
}
