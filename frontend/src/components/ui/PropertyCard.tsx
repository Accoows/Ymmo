import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Property } from "../../types";
import Badge from "./Badge";

interface PropertyCardProps {
  property: Property;
  variant?: "featured" | "regular" | "compact";
  className?: string;
  priority?: boolean;
}

function formatSurface(n: number) {
  return `${n} m²`;
}

const BedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
    <path d="M2 14h20" />
    <path d="M7 14V9a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5" />
  </svg>
);

const BathIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 6a3 3 0 1 1 6 0v8H9V6z" />
    <path d="M3 14h18v1a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-1z" />
  </svg>
);

const AreaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="M3 9h18M9 3v18" />
  </svg>
);

export default function PropertyCard({
  property,
  variant = "regular",
  className = "",
}: PropertyCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <motion.div
      className={`property-card group cursor-pointer ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to={`/properties/${property.id}`}
        className="block"
        aria-label={`Voir la propriété: ${property.title}`}
      >
        {/* Image */}
        <div
          className={`overflow-hidden bg-stone/20 relative ${
            isFeatured ? "aspect-[16/9]" : isCompact ? "aspect-[4/3]" : "aspect-[4/3]"
          }`}
        >
          {property.image ? (
            <img
              src={property.image}
              alt={property.title}
              className="img-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-stone/10 flex items-center justify-center">
              <span className="text-label text-stone">Sans photo</span>
            </div>
          )}

          {/* Type badge overlay */}
          <div className="absolute top-4 left-4">
            <Badge variant="dark">{property.type}</Badge>
          </div>

          {/* Featured: overlay gradient */}
          {isFeatured && (
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
          )}
        </div>

        {/* Content */}
        <div
          className={`border-x border-b ${
            isCompact ? "p-4" : "p-5 lg:p-6"
          } bg-surface`}
          style={{ borderColor: "var(--gold-border)" }}
        >
          {/* Location */}
          <p className="text-label text-stone mb-2">{property.location}</p>

          {/* Title */}
          <h3
            className={`font-display font-medium text-ink leading-tight mb-3 group-hover:text-gold transition-colors duration-200 ${
              isFeatured
                ? "text-2xl lg:text-3xl"
                : isCompact
                ? "text-lg"
                : "text-xl lg:text-2xl"
            }`}
          >
            {property.title}
          </h3>

          {/* Price */}
          <p
            className={`text-price mb-4 ${
              isFeatured ? "text-xl" : isCompact ? "text-base" : "text-lg"
            }`}
          >
            {property.price}
          </p>

          {/* Stats */}
          <div
            className="flex items-center gap-4 pt-4 border-t"
            style={{ borderColor: "var(--gold-border)" }}
          >
            <span className="flex items-center gap-1.5 text-stone text-xs">
              <BedIcon />
              <span>{property.bedrooms}</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone text-xs">
              <BathIcon />
              <span>{property.bathrooms}</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone text-xs">
              <AreaIcon />
              <span>{formatSurface(property.surface)}</span>
            </span>
            <span
              className="ml-auto text-[10px] uppercase tracking-wider text-stone/60 truncate max-w-[42%]"
              title={property.agency.name}
            >
              {property.agency.name}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
