"use client";

import { forwardRef } from "react";

const BrandInput = forwardRef(
    (
        {
            label,
            error,
            icon: Icon,
            type = "text",
            placeholder = "",
            className = "",
            ...props
        },
        ref
    ) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-[#3F1F00] mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {Icon && (
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C9933A]/60 pointer-events-none" />
                    )}
                    <input
                        ref={ref}
                        type={type}
                        placeholder={placeholder}
                        className={`
              w-full px-4 py-3 
              ${Icon ? "pl-12" : ""}
              bg-white text-[#1A0A00] 
              border border-[#C9933A]/40
              rounded-xl
              focus:outline-none 
              focus:border-[#C9933A] 
              focus:ring-1 
              focus:ring-[#C9933A]/30
              placeholder:text-[#3F1F00]/40
              transition-all
              ${error ? "border-red-400 focus:ring-red-400" : ""}
              ${className}
            `}
                        {...props}
                    />
                    {error && (
                        <p className="text-sm text-red-500 mt-1.5">{error}</p>
                    )}
                </div>
            </div>
        );
    }
);

BrandInput.displayName = "BrandInput";

export { BrandInput };
