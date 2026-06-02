import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, canManage, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Accueil" },
    { to: "/properties", label: "Propriétés" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ink/95 backdrop-blur-sm shadow-[0_1px_0_rgba(184,154,94,0.2)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-editorial mx-auto px-6 lg:px-16 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl lg:text-2xl font-light italic text-gold tracking-title"
          style={{ letterSpacing: "0.04em" }}
        >
          Prestige<span className="font-normal not-italic text-surface/80 mx-1">·</span>Immobilier
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `text-label transition-colors duration-200 ${
                  isActive
                    ? "text-gold"
                    : "text-surface/60 hover:text-surface/90"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {canManage && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-label transition-colors duration-200 ${
                  isActive ? "text-gold" : "text-surface/60 hover:text-surface/90"
                }`
              }
            >
              Admin
            </NavLink>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-label text-surface/60 hover:text-gold transition-colors duration-200"
            >
              Déconnexion
            </button>
          ) : (
            <Link
              to="/login"
              className="text-label border border-gold-dim px-5 py-2.5 text-gold hover:bg-gold hover:text-ink transition-all duration-200"
              style={{ borderColor: "var(--gold-border)" }}
            >
              Connexion
            </Link>
          )}
        </nav>

        {/* Mobile burger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-px bg-surface transition-transform duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block w-6 h-px bg-surface transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-px bg-surface transition-transform duration-300 ${menuOpen ? "-translate-y-2.5 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:hidden bg-ink border-t border-gold-dim overflow-hidden"
            style={{ borderColor: "var(--gold-border)" }}
          >
            <div className="px-6 py-6 flex flex-col gap-6">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `font-display text-2xl font-light italic ${
                      isActive ? "text-gold" : "text-surface/80"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {canManage && (
                <NavLink
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `font-display text-2xl font-light italic ${
                      isActive ? "text-gold" : "text-surface/80"
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
              <div className="divider-gold" />
              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="text-label text-stone text-left hover:text-gold transition-colors"
                >
                  Déconnexion
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-label text-gold"
                >
                  Connexion espace agent
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
