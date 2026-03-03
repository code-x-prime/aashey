"use client";

export const SectionHeading = ({
    title,
    subtitle = "",
    centered = true,
    underline = true
}) => {
    return (
        <div className={`${centered ? "text-center" : ""} mb-12`}>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-[#3F1F00] mb-2 tracking-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="text-[#5C3A1E] text-base md:text-lg max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
            {underline && centered && (
                <div className="flex justify-center mt-6">
                    <div className="w-16 h-1 bg-gradient-to-r from-[#C9933A] to-[#F0C96B] rounded-full" />
                </div>
            )}
        </div>
    );
};
