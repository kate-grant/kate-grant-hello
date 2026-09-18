import type { CSSProperties, ReactNode } from "react";

type CardSize = "sm" | "md" | "lg" | "xl";
type CardVariant = "default" | "parchment" | "dark" | "light";

interface CardProps {
  children: ReactNode;
  size?: CardSize;
  variant?: CardVariant;
  className?: string;
  style?: CSSProperties;
}

const sizeClasses: Record<CardSize, string> = {
  sm: "w-full max-w-64 p-4",
  md: "w-full max-w-80 p-5 sm:p-6",
  lg: "w-full max-w-96 p-6 sm:p-8",
  xl: "w-full max-w-6xl p-5 sm:p-10 lg:p-14",
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-pink-50/90",
  parchment: "bg-parchment",
  dark: "bg-black/75 backdrop-blur-md text-white",
  light: "bg-[#fdffbf]/70 backdrop-blur-md text-black",
};

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
