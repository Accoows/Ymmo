import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import ImageGallery from "../components/ui/ImageGallery";
import ContactForm from "../components/ui/ContactForm";
import PropertyMap from "../components/ui/PropertyMap";
import Badge from "../components/ui/Badge";
import { ButtonLink } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";
import { fetchPropertyById } from "../lib/api";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="text-center p-5 border" style={{ borderColor: "var(--gold-border)" }}>
    <div className="flex justify-center mb-2 text-gold">{icon}</div>
    <p className="text-price text-xl mb-1">{value}</p>
    <p className="text-label text-stone">{label}</p>
  </div>
);

const BedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 14h20M7 14V9a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5" />
  </svg>
);

const BathIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 6a3 3 0 1 1 6 0v8H9V6zM3 14h18v1a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-1z" />
  </svg>
);

const AreaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="M3 9h18M9 3v18" />
  </svg>
);

const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-5.4A2 2 0 0 0 11.5 4.5H8a2 2 0 0 0-1.8 1.1L4 11l-2.16.86A1 1 0 0 0 1 12.85V16h3m-1 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm12 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
  </svg>
);

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-20">
          <PageSpinner />
        </div>
      </Layout>
    );
  }

  if (isError || !property) {
    return (
      <Layout>
        <div className="pt-32 pb-20 max-w-editorial mx-auto px-6 lg:px-16 text-center">
          <p className="font-display text-3xl font-light italic text-stone mb-6">
            Propriété introuvable
          </p>
          <ButtonLink to="/properties" variant="ghost">
            Retour aux propriétés
          </ButtonLink>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="pt-24 bg-ink">
        <div className="max-w-editorial mx-auto px-6 lg:px-16 pt-8 pb-0">
          <nav className="flex items-center gap-2 text-xs text-stone mb-8">
            <Link to="/" className="hover:text-gold transition-colors">Accueil</Link>
            <span className="text-gold/30">/</span>
            <Link to="/properties" className="hover:text-gold transition-colors">Propriétés</Link>
            <span className="text-gold/30">/</span>
            <span className="text-surface/60">{property.title}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4 pb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="gold">{property.type}</Badge>
                {property.year && (
                  <span className="text-label text-stone">Réf. {property.year}</span>
                )}
              </div>
              <h1
                className="font-display font-light italic text-surface"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.0 }}
              >
                {property.title}
              </h1>
              <p className="text-stone text-sm mt-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {property.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-label text-stone mb-2">Prix</p>
              <p className="text-price text-3xl lg:text-4xl">{property.price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-editorial mx-auto px-6 lg:px-16 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Gallery */}
            <ImageGallery images={property.gallery} title={property.title} />

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              <StatCard icon={<BedIcon />} label="Chambres" value={property.bedrooms} />
              <StatCard icon={<BathIcon />} label="Salles de bain" value={property.bathrooms} />
              <StatCard icon={<AreaIcon />} label="Surface" value={`${property.surface} m²`} />
              <StatCard icon={<CarIcon />} label="Garages" value={property.parking} />
            </div>

            {/* Description */}
            <div className="mt-12">
              <p className="text-label text-stone mb-6">Description</p>
              <div className="divider-gold mb-8" />
              <p className="text-ink/80 leading-relaxed text-base font-body">
                {property.description}
              </p>
            </div>

            {/* Features */}
            {property.features.length > 0 && (
              <div className="mt-12">
                <p className="text-label text-stone mb-6">Prestations</p>
                <div className="divider-gold mb-8" />
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-ink/80"
                    >
                      <span className="text-gold flex-shrink-0">
                        <CheckIcon />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Localisation */}
            <div className="mt-12">
              <p className="text-label text-stone mb-6">Localisation</p>
              <div className="divider-gold mb-8" />
              <p className="text-sm text-ink/80 mb-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {property.location}
              </p>
              {property.latitude != null && property.longitude != null ? (
                <PropertyMap
                  points={[
                    {
                      id: property.id,
                      title: property.title,
                      location: property.location,
                      latitude: property.latitude,
                      longitude: property.longitude,
                      priceLabel: property.price,
                    },
                  ]}
                  height={360}
                  singleZoom={12}
                />
              ) : (
                <p className="text-stone text-sm">
                  Localisation cartographique indisponible pour ce bien.
                </p>
              )}
            </div>
          </motion.div>

          {/* Right column — sticky contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:sticky lg:top-28"
          >
            <div
              className="border p-6 lg:p-8"
              style={{ borderColor: "var(--gold-border)" }}
            >
              <p className="text-label text-stone mb-2">Demande d'information</p>
              <h3 className="font-display text-2xl font-medium text-ink mb-6">
                Nous contacter
              </h3>
              <ContactForm
                propertyId={property.id}
                propertyTitle={property.title}
              />
            </div>

            {/* Quick contact */}
            <div
              className="mt-4 p-5 border flex items-center gap-4"
              style={{ borderColor: "var(--gold-border)", background: "var(--surface)" }}
            >
              <div className="w-10 h-10 bg-gold/15 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.59 2 2 0 0 1 3.59 1.4h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
                </svg>
              </div>
              <div>
                <p className="text-label text-stone mb-0.5">Appel direct</p>
                <p className="text-sm font-body text-ink font-medium">+33 (0)1 40 00 00 00</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
