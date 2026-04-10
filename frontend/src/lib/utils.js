import { clsx } from "clsx";

/**
 * cn — class name utility
 * Merges class names cleanly using clsx.
 * No longer needs tailwind-merge since we use SCSS classes.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
