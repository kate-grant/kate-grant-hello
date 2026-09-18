import { jsx as _jsx } from "react/jsx-runtime";
const sizeClasses = {
    sm: "w-64 p-4",
    md: "w-80 p-6",
    lg: "w-96 p-8",
    xl: "w-full max-w-6xl p-6 sm:p-10 lg:p-14",
};
const variantClasses = {
    default: "bg-pink-50/90",
    parchment: "bg-parchment",
    dark: "bg-black text-white",
};
/**
 * A surface, not a layout. The card no longer forces `flex` or a minimum
 * height; pass layout classes (grid, flex, gap) through `className`.
 */
const Card = ({ children, size = "md", variant = "default", className = "", style, }) => {
    return (_jsx("div", { style: style, "data-occludes-shapes": true, className: `${sizeClasses[size]} ${variantClasses[variant]} rounded-2xl text-left font-sans ${className}`, children: children }));
};
export default Card;
