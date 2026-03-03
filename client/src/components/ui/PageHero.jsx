import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const PageHero = ({ 
  title, 
  description, 
  breadcrumbs = [],
  variant = "default",
  size = "md"
}) => {
  const variants = {
    default: "bg-gradient-to-b from-[#3F1F00] to-[#3F1F00]/90",
    gradient: "bg-gradient-to-br from-[#3F1F00] via-[#3F1F00]/95 to-[#092D15]",
    dark: "bg-[#092D15]",
    white: "bg-[#FDF6E3]",
  };

  const sizes = {
    sm: "py-12 md:py-16",
    md: "py-14 md:py-18",
    lg: "py-16 md:py-20",
  };

  const isLight = variant === "white";

  return (
    <section className={`${variants[variant]} ${sizes[size]} border-b border-[#C9933A]/15`}>
      <div className="section-container">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 font-sans text-sm mb-5">
            <Link 
              href="/" 
              className={`transition-colors ${
                isLight ? "text-[#6B4423] hover:text-[#3F1F00]" : "text-[#FDF6E3]/75 hover:text-[#FDF6E3]"
              }`}
            >
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                <ChevronRight className={`h-3.5 w-3.5 ${isLight ? "text-[#8B6040]" : "text-[#FDF6E3]/65"}`} />
                {crumb.href ? (
                  <Link 
                    href={crumb.href}
                    className={`transition-colors ${
                      isLight ? "text-[#6B4423] hover:text-[#3F1F00]" : "text-[#FDF6E3]/75 hover:text-[#FDF6E3]"
                    }`}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLight ? "text-[#C9933A] font-medium" : "text-[#C9933A] font-medium"}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className={`font-cormorant text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 max-w-4xl ${
          isLight ? "text-[#3F1F00]" : "text-[#FDF6E3]"
        }`}>
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className={`font-sans text-base md:text-lg max-w-3xl ${
            isLight ? "text-[#5C3A1E]" : "text-[#FDF6E3]/65"
          }`}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
