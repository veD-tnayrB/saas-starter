"use client";

import { HTMLMotionProps, motion } from "framer-motion";

interface FramerWrapperProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function FramerWrapper({ children, ...props }: FramerWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
