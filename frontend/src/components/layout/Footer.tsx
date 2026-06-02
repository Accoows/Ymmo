import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-surface">
      <div className="max-w-editorial mx-auto px-6 lg:px-16">
        {/* Top divider with gold */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-40" />

        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <p className="font-display text-2xl font-light italic text-gold mb-4">
              Prestige·Immobilier
            </p>
            <p className="text-stone text-sm leading-relaxed max-w-xs">
              Propriétés d'exception sur les plus beaux marchés français. Discrétion, 
              expertise et service sur-mesure depuis 2005.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-label text-stone mb-6">Navigation</p>
            <div className="flex flex-col gap-3">
              {[
                { to: "/", label: "Accueil" },
                { to: "/properties", label: "Nos propriétés" },
                { to: "/contact", label: "Nous contacter" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-surface/60 hover:text-gold text-sm transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-label text-stone mb-6">Contact</p>
            <div className="flex flex-col gap-3 text-sm text-surface/60">
              <p>contact@prestige-immobilier.fr</p>
              <p>+33 (0)1 40 00 00 00</p>
              <p className="leading-relaxed">
                25 Avenue Montaigne<br />
                75008 Paris
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
          style={{ borderColor: "var(--gold-border)" }}
        >
          <p className="text-stone text-xs">
            © {year} Prestige Immobilier. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <span className="text-stone text-xs">Mentions légales</span>
            <span className="text-stone text-xs">Politique de confidentialité</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
