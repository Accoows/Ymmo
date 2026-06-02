import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendContact } from "../../lib/api";
import type { ContactPayload } from "../../types";
import Button from "./Button";

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  dark?: boolean;
}

export default function ContactForm({
  propertyId,
  propertyTitle,
  dark = false,
}: ContactFormProps) {
  const [form, setForm] = useState<ContactPayload>({
    name: "",
    email: "",
    phone: "",
    subject: propertyTitle ? `Renseignements — ${propertyTitle}` : "",
    message: "",
    propertyId,
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: sendContact,
    onSuccess: () => setSubmitted(true),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ContactPayload = { ...form };
    if (!payload.phone) delete payload.phone;
    if (!payload.propertyId) delete payload.propertyId;
    mutation.mutate(payload);
  };

  const inputClass = `input-field ${dark ? "input-field-dark" : ""}`;
  const labelClass = `text-label block mb-2 ${dark ? "text-surface/50" : "text-stone"}`;

  if (submitted) {
    return (
      <div
        className={`border p-8 text-center ${
          dark ? "border-gold/30 bg-gold/5" : "border-gold/30 bg-gold/5"
        }`}
      >
        <div className="text-gold text-3xl font-display italic mb-3">Merci</div>
        <p className={`text-sm ${dark ? "text-surface/60" : "text-stone"}`}>
          Votre message a bien été envoyé. Un conseiller vous contactera dans
          les 24 heures.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-1">
          <label htmlFor="name" className={labelClass}>
            Nom complet *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Jean Dupont"
            className={inputClass}
            autoComplete="name"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="email" className={labelClass}>
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="jean@example.com"
            className={inputClass}
            autoComplete="email"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="phone" className={labelClass}>
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+33 6 00 00 00 00"
            className={inputClass}
            autoComplete="tel"
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="subject" className={labelClass}>
            Sujet *
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            value={form.subject}
            onChange={handleChange}
            placeholder="Sujet de votre message"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelClass}>
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={form.message}
            onChange={handleChange}
            placeholder="Votre message..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {mutation.isError && (
        <p className="mt-4 text-red-400 text-xs font-body">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}

      <div className="mt-6">
        <Button
          type="submit"
          variant={dark ? "ghost" : "primary"}
          size="md"
          disabled={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? "Envoi en cours…" : "Envoyer le message"}
        </Button>
      </div>
    </form>
  );
}
