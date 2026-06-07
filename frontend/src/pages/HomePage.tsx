import { useRef } from "react";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import PropertyCard from "../components/ui/PropertyCard";
import { ButtonLink } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";
import { useFeaturedProperty } from "../hooks/useFeaturedProperty";
import { useProperties } from "../hooks/useProperties";
import storefrontImg from "../assets/storefront.jpg";

function HeroSection() {
  const { data: featured, isLoading } = useFeaturedProperty();

  if (isLoading) return <div className="h-screen bg-ink" />;
  if (!featured) return null;

  return (
    <section className="relative h-screen min-h-[600px] bg-ink noise-overlay overflow-hidden">
      {/* Background image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {featured.image && (
          <img
            src={featured.image}
            alt={featured.title}
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
        )}
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10 z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent z-[2]" />

      {/* Editorial caption — bottom left */}
      <div className="absolute bottom-0 left-0 right-0 z-[3] max-w-editorial mx-auto px-6 lg:px-16 pb-12 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Label */}
          <p className="text-label text-gold mb-4">Propriété à la une</p>

          {/* Title */}
          <h1
            className="font-display font-light italic text-surface leading-[0.94] mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            {featured.title}
          </h1>

          {/* Location + type */}
          <p className="text-stone text-sm font-body mb-6">
            {featured.location}
            <span className="mx-3 text-gold/40">|</span>
            <span className="capitalize">{featured.type}</span>
          </p>

          {/* Price + CTA */}
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-price text-2xl">{featured.price}</span>
            <ButtonLink to={`/properties/${featured.id}`} variant="ghost" size="md">
              Découvrir cette propriété
            </ButtonLink>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-8 lg:right-16 z-[3] flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-label text-stone" style={{ writingMode: "vertical-rl" }}>
          Défiler
        </span>
        <motion.div
          className="w-px h-12 bg-gold/30"
          animate={{ scaleY: [0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}

function PropertyGrid() {
  const { data, isLoading } = useProperties({ limit: 6 });

  if (isLoading) return <PageSpinner />;
  if (!data?.properties.length) return null;

  const properties = data.properties;

  return (
    <section className="max-w-editorial mx-auto px-6 lg:px-16 py-20 lg:py-32">
      {/* Section header */}
      <div className="flex items-end justify-between mb-12 lg:mb-16">
        <div>
          <p className="text-label text-stone mb-4">Notre sélection</p>
          <h2
            className="font-display font-normal text-ink"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05 }}
          >
            Propriétés d'exception
          </h2>
        </div>
        <ButtonLink to="/properties" variant="ghost" size="sm" className="hidden lg:inline-flex">
          Voir tout
        </ButtonLink>
      </div>

      {/* Editorial asymmetric grid */}
      <div className="space-y-4">
        {/* Row 1: Full-width featured */}
        {properties[0] && (
          <PropertyCard property={properties[0]} variant="featured" />
        )}

        {/* Row 2: Two columns */}
        {(properties[1] || properties[2]) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties[1] && <PropertyCard property={properties[1]} />}
            {properties[2] && <PropertyCard property={properties[2]} />}
          </div>
        )}

        {/* Row 3: Three columns */}
        {(properties[3] || properties[4] || properties[5]) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties[3] && <PropertyCard property={properties[3]} variant="compact" />}
            {properties[4] && <PropertyCard property={properties[4]} variant="compact" />}
            {properties[5] && <PropertyCard property={properties[5]} variant="compact" />}
          </div>
        )}
      </div>

      {/* Mobile CTA */}
      <div className="mt-10 lg:hidden text-center">
        <ButtonLink to="/properties" variant="ghost" size="md">
          Voir toutes les propriétés
        </ButtonLink>
      </div>
    </section>
  );
}

function ValueSection() {
  const items = [
    {
      number: "01",
      title: "Expertise exclusive",
      body: "Plus de 20 ans de présence sur les marchés les plus prisés de France. Nous connaissons chaque adresse, chaque vendeur, chaque opportunité discrète.",
    },
    {
      number: "02",
      title: "Accompagnement sur-mesure",
      body: "De la première visite à la signature définitive, votre conseiller dédié est disponible à chaque étape, en total discrétion.",
    },
    {
      number: "03",
      title: "Un réseau sans équivalent",
      body: "L'accès à des biens exclusifs avant leur mise sur le marché, pour les acquéreurs les plus exigeants.",
    },
  ];

  return (
    <section 
      className="relative bg-cover bg-center"
      style={{ backgroundImage: `url(${storefrontImg})` }}
    >
      <div className="absolute inset-0 bg-ink opacity-80 z-[1]" />
      <div className="relative z-[2] max-w-editorial mx-auto px-6 lg:px-16 py-20 lg:py-32">
        <div className="mb-16">
          <p className="text-label text-gold mb-4">Notre approche</p>
          <h2
            className="font-display font-light italic text-surface"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05 }}
          >
            Au-delà de l'immobilier
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {items.map((item, i) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="p-8 lg:p-10 border-l first:border-l-0 md:first:border-l-0"
              style={{ borderColor: "var(--gold-border)" }}
            >
              <p
                className="font-display font-light text-gold mb-6"
                style={{ fontSize: "4rem", lineHeight: 1, textShadow: "0 0 16px rgba(255,215,0,0.35)" }}
              >
                {item.number}
              </p>
              <h3 className="font-display text-xl font-medium text-surface mb-4">
                {item.title}
              </h3>
              <p className="text-stone text-sm leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section
      className="border-y"
      style={{ borderColor: "var(--gold-border)" }}
    >
      <div className="max-w-editorial mx-auto px-6 lg:px-16 py-16 lg:py-24 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-label text-stone mb-4">Un projet en tête ?</p>
          <h2
            className="font-display font-normal text-ink"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", lineHeight: 1.1 }}
          >
            Parlons de votre recherche
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <ButtonLink to="/contact" variant="primary" size="lg">
            Prendre contact
          </ButtonLink>
          <ButtonLink to="/properties" variant="ghost" size="lg">
            Explorer les biens
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <Layout dark={false}>
      <HeroSection />
      <div ref={gridRef}>
        <PropertyGrid />
      </div>
      <ValueSection />
      <CtaBanner />
    </Layout>
  );
}