import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import ContactForm from "../components/ui/ContactForm";

const offices = [
  {
    city: "Paris",
    address: "25 Avenue Montaigne",
    zip: "75008 Paris",
    phone: "+33 (0)1 40 00 00 00",
    email: "paris@prestige-immobilier.fr",
  },
  {
    city: "Côte d'Azur",
    address: "12 Boulevard de la Croisette",
    zip: "06400 Cannes",
    phone: "+33 (0)4 93 00 00 00",
    email: "cote-azur@prestige-immobilier.fr",
  },
  {
    city: "Bordeaux",
    address: "8 Cours du Chapeau Rouge",
    zip: "33000 Bordeaux",
    phone: "+33 (0)5 56 00 00 00",
    email: "bordeaux@prestige-immobilier.fr",
  },
];

export default function ContactPage() {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-ink pt-32 pb-16">
        <div className="max-w-editorial mx-auto px-6 lg:px-16">
          <p className="text-label text-gold mb-4">Nous rejoindre</p>
          <h1
            className="font-display font-light italic text-surface"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 0.96 }}
          >
            Parlons de
            <br />
            votre projet
          </h1>
          <p className="text-stone text-sm mt-6 max-w-lg leading-relaxed">
            Notre équipe de conseillers est disponible du lundi au samedi, 
            de 9h à 19h, pour répondre à toutes vos questions et vous accompagner 
            dans votre recherche.
          </p>
        </div>
      </div>

      <div className="max-w-editorial mx-auto px-6 lg:px-16 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-16 lg:gap-24">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-label text-stone mb-8">Formulaire de contact</p>
            <div className="divider-gold mb-10" />
            <ContactForm />
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <p className="text-label text-stone mb-8">Nos agences</p>
            <div className="divider-gold mb-10" />

            <div className="space-y-0">
              {offices.map((office, i) => (
                <div
                  key={office.city}
                  className={`py-8 ${i < offices.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "var(--gold-border)" }}
                >
                  <p className="font-display text-xl font-medium text-ink mb-4">
                    {office.city}
                  </p>
                  <div className="space-y-2 text-sm text-stone">
                    <p>{office.address}</p>
                    <p>{office.zip}</p>
                    <p className="text-ink mt-3">{office.phone}</p>
                    <p className="text-gold text-xs font-body tracking-wide">
                      {office.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Availability note */}
            <div
              className="mt-8 p-6 border bg-gold/5"
              style={{ borderColor: "var(--gold-border)" }}
            >
              <p className="text-label text-gold mb-3">Disponibilités</p>
              <p className="text-sm text-stone leading-relaxed">
                Lundi – Samedi, 9h – 19h
                <br />
                Visites sur rendez-vous uniquement
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
