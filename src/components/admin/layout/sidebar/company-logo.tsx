import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface CompanyLogoProps {
  logo?: string;
  companyName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  alt?: string;
}

const sizeClasses: Record<NonNullable<CompanyLogoProps["size"]>, string> = {
  sm: "w-6 h-6 text-sm",
  md: "w-8 h-8 text-base",
  lg: "w-10 h-10 text-lg",
};

export function CompanyLogo({
  logo,
  companyName,
  className,
  size = "md",
  alt = "Company Logo",
}: CompanyLogoProps) {
  const initial = companyName && companyName.charAt(0).toUpperCase();
  const [imgError, setImgError] = useState(false);

  if (logo && !imgError) {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <Image
          src={logo}
          alt={`${companyName} logo`}
          fill
          sizes="(max-width: 768px) 100vw, 40px"
          className="rounded-full object-cover"
          onError={(e) => {
            // Fallback to initial if image fails to load
            const imgElement = e.currentTarget as HTMLImageElement;
            imgElement.style.display = "none"; // Prevent infinite loop
            setImgError(true); // Clear the src to avoid showing broken image
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold",
        sizeClasses[size],
        className
      )}
      title={companyName || "Company"}
      aria-label={`${companyName || "Company"} logo`}
      role="img"
    >
      {initial}
    </div>
  );
}

export default CompanyLogo;
