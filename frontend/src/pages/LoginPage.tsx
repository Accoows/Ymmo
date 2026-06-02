import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/admin");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-ink/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <Link to="/" className="font-display text-3xl font-light italic text-gold mb-4">
            Prestige·Immobilier
          </Link>
          <p className="text-stone text-sm max-w-xs leading-relaxed">
            Espace réservé aux conseillers et administrateurs de la plateforme.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden font-display text-2xl font-light italic text-gold block mb-10">
            Prestige·Immobilier
          </Link>

          <p className="text-label text-gold mb-4">Espace agent</p>
          <h1 className="font-display text-4xl font-light italic text-surface mb-10">
            Connexion
          </h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="text-label text-surface/40 block mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@prestige-immobilier.fr"
                required
                autoComplete="email"
                className="input-field input-field-dark"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-label text-surface/40 block mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="input-field input-field-dark"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs font-body py-2"
              >
                {error}
              </motion.p>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Connexion…" : "Se connecter"}
              </Button>
            </div>
          </form>

          <div
            className="mt-10 pt-6 border-t"
            style={{ borderColor: "var(--gold-border)" }}
          >
            <Link to="/" className="text-label text-stone hover:text-gold transition-colors">
              ← Retour au site
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
