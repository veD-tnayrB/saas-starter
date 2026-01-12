"use client";

import { AvatarProps } from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps extends AvatarProps {
  user: {
    image: string | null;
    name: string | null;
    email?: string | null;
  };
}

/**
 * Normalize a string for consistent hashing
 * - Trim whitespace
 * - Convert to lowercase
 * - For emails: also normalize the email format (remove spaces, etc.)
 * - For names: normalize multiple spaces to single space
 */
function normalizeString(str: string | null | undefined): string {
  if (!str) return "";
  const trimmed = str.trim().toLowerCase();

  // If it looks like an email, ensure consistent email format
  if (trimmed.includes("@")) {
    return trimmed.replace(/\s+/g, ""); // Remove all spaces from emails
  }

  // For names, normalize multiple spaces to single space
  return trimmed.replace(/\s+/g, " ");
}

/**
 * Generate a consistent hash from a string
 */
function generateHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a consistent color based on email (primary) or name (fallback)
 * Returns a Tailwind background color class
 *
 * IMPORTANT: Email is used as the primary identifier because:
 * - Email is unique and consistent per user
 * - Names can vary across different contexts (e.g., "Bryant Caballero 2" vs "Bryant Caballero 23")
 * - This ensures the same user always gets the same color regardless of name variations
 */
function getAvatarColor(name: string | null, email?: string | null): string {
  // Prioritize email over name for color consistency
  // Email is unique and consistent, while names can vary
  let identifier: string;

  // Check if email exists and is not empty after normalization
  const normalizedEmail = normalizeString(email);
  if (normalizedEmail && normalizedEmail.length > 0) {
    identifier = normalizedEmail;
  } else {
    // Fallback to name only if email is not available
    const normalizedName = normalizeString(name);
    identifier =
      normalizedName && normalizedName.length > 0 ? normalizedName : "";
  }

  if (!identifier || identifier.length === 0) return "bg-muted";

  // Generate hash from normalized identifier
  const hash = generateHash(identifier);

  // Use the hash to select from a predefined palette of colors
  // These are vibrant, accessible colors that work well for avatars
  const colors = [
    "bg-primary",
    "bg-primary/80",
    "bg-muted-foreground",
    "bg-muted-foreground/80",
    "bg-accent",
    "bg-accent-foreground/20",
  ];

  const colorIndex = hash % colors.length;
  return colors[colorIndex];
}

/**
 * Get the first letter(s) of a name for the avatar fallback
 */
function getInitials(name: string | null, email?: string | null): string {
  // Try name first
  if (name) {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      // Get first letter of first word and first letter of last word (if exists)
      const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
      if (words.length === 1) {
        return words[0][0].toUpperCase();
      }
      // Return first letter of first and last word
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
  }

  // Fallback to email if no name
  if (email) {
    const normalizedEmail = normalizeString(email);
    if (normalizedEmail.length > 0) {
      return normalizedEmail[0].toUpperCase();
    }
  }

  return "?";
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  const initials = getInitials(user.name, user.email);
  const bgColor = getAvatarColor(user.name, user.email);

  return (
    <Avatar {...props}>
      {user.image && (
        <AvatarImage
          alt={user.name || "User avatar"}
          src={user.image}
          referrerPolicy="no-referrer"
        />
      )}
      <AvatarFallback
        className={cn("select-none text-sm font-semibold text-white", bgColor)}
      >
        <span className="sr-only">{user.name || "User"}</span>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
