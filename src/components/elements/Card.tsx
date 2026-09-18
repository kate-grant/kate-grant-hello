import type { CSSProperties, ReactNode } from "react";

type CardSize = "sm" | "md" | "lg" | "xl";
type CardVariant = "default" | "parchment" | "dark";

interface CardProps {
  children: ReactNode;
  size?: CardSize;
  variant?: CardVariant;
  className?: string;
  style?: CSSProperties;
}

const sizeClasses: Record<CardSize, string> = {
  sm: "w-64 p-4",
  md: "w-80 p-6",
  lg: "w-96 p-8",
  xl: "w-full max-w-6xl p-6 sm:p-10 lg:p-14",
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-pink-50/90",
  parchment: "bg-parchment",
  dark: "bg-black text-white",
};

/**
 * A surface, not a layout. The card no longer forces `flex` or a minimum
 * height; pass layout classes (grid, flex, gap) through `className`.
 */
const Card = ({
  children,
  size = "md",
  variant = "default",
  className = "",
  style,
}: CardProps) => {
  return (
    <div
      style={style}
      data-occludes-shapes
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-2xl text-left font-sans ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
