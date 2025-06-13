/**
 * TemanTrip Brand Color Palette
 * Standarisasi warna untuk aplikasi TemanTrip
 */

export const BRAND_COLORS = {
  // Primary Brand Colors
  PRIMARY: "#95B1EE",
  PRIMARY_HOVER: "#7495DE", 
  PRIMARY_FOCUS: "#6B8DD6",
  
  // Secondary Colors
  SECONDARY: "#D5E0F8",
  SECONDARY_HOVER: "#C8D8F5",
  
  // Background Colors
  BACKGROUND_DEFAULT: "#F4F7FD", // Default page background - applied globally
  BACKGROUND_LIGHT: "#E8F0FE",
  BACKGROUND_LIGHTER: "#F5F8FF",
  
  // Text Colors
  TEXT_PRIMARY: "#1F2937",
  TEXT_SECONDARY: "#6B7280",
  TEXT_MUTED: "#9CA3AF",
  
  // State Colors
  SUCCESS: "#10B981",
  ERROR: "#EF4444",
  WARNING: "#F59E0B",
  INFO: "#3B82F6",
} as const;

export const TAILWIND_CLASSES = {
  // Button Classes
  BUTTON_PRIMARY: "bg-brand-primary hover:bg-brand-primaryHover",
  BUTTON_SECONDARY: "bg-brand-secondary hover:bg-brand-secondary/80",
  
  // Text Classes
  TEXT_BRAND: "text-brand-primary",
  TEXT_BRAND_HOVER: "hover:text-brand-primaryHover",
  
  // Background Classes
  BG_BRAND_DEFAULT: "bg-brand-background",
  BG_BRAND_LIGHT: "bg-brand-secondary",
  BG_BRAND_LIGHTER: "bg-brand-light",
  
  // Link Classes
  LINK_BRAND: "text-brand-primary hover:text-brand-primaryHover hover:underline",
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;
export type TailwindClass = keyof typeof TAILWIND_CLASSES; 