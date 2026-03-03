"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const BrandButton = forwardRef(
    (
        {
            children,
            variant = "primary",
            fullWidth = false,
            className = "",
            disabled = false,
            ...props
        },
        ref
    ) => {
        const variants = {
            primary: "bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3] hover:text-[#3F1F00]",
            gold: "bg-[#C9933A] hover:bg-[#F0C96B] text-[#3F1F00] hover:text-[#1A0A00]",
            outline: "bg-white border-2 border-[#C9933A] text-[#3F1F00] hover:bg-[#FDF6E3]",
            secondary: "bg-[#092D15] hover:bg-[#0F4820] text-[#FDF6E3]",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    fullWidth && "w-full",
                    className
                )}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        );
    }
);

BrandButton.displayName = "BrandButton";

export { BrandButton };
