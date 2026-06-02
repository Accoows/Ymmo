import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { PageSpinner } from "../ui/Spinner";
import { useContactMessages } from "../../hooks/useContactMessages";
import { deleteContactMessage } from "../../lib/api";
import type { ContactMessage } from "../../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MessageCardProps {
  message: ContactMessage;
  confirming: boolean;
  deleting: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

const actionClass =
  "text-label px-3 py-1.5 border transition-colors";

function MessageCard({
  message: m,
  confirming,
  deleting,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: MessageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="border p-6"
      style={{ borderColor: "var(--gold-border)" }}
    >
      {/* Header: subject + date + related property */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display text-xl font-medium italic text-ink leading-tight">
            {m.subject}
          </h3>
          <p className="text-label text-stone mt-1.5">{formatDate(m.createdAt)}</p>
        </div>
        {m.propertyId &&
          (m.propertyName ? (
            <Link
              to={`/properties/${m.propertyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 transition-opacity hover:opacity-80"
              title="Voir la fiche du bien (nouvel onglet)"
            >
              <Badge variant="gold">Bien : {m.propertyName} ↗</Badge>
            </Link>
          ) : (
            <Badge variant="stone">Bien supprimé</Badge>
          ))}
      </div>

      {/* Contact info */}
      <div className="flex flex-wrap gap-x-10 gap-y-3 mb-5 text-sm">
        <div>
          <span className="text-label text-stone block mb-0.5">Nom</span>
          <span className="text-ink">{m.name}</span>
        </div>
        <div>
          <span className="text-label text-stone block mb-0.5">Email</span>
          <a href={`mailto:${m.email}`} className="text-gold hover:underline">
            {m.email}
          </a>
        </div>
        <div>
          <span className="text-label text-stone block mb-0.5">Téléphone</span>
          {m.phone ? (
            <a href={`tel:${m.phone}`} className="text-gold hover:underline">
              {m.phone}
            </a>
          ) : (
            <span className="text-stone">—</span>
          )}
        </div>
      </div>

      {/* Message body */}
      <div className="mb-5">
        <span className="text-label text-stone block mb-1.5">Message</span>
        <p className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed">
          {m.message}
        </p>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-end gap-3 pt-4 border-t"
        style={{ borderColor: "var(--gold-border)" }}
      >
        <a
          href={`mailto:${m.email}?subject=${encodeURIComponent("Re : " + m.subject)}`}
          className={`${actionClass} text-stone hover:text-gold`}
          style={{ borderColor: "var(--gold-border)" }}
        >
          Répondre
        </a>

        {confirming ? (
          <>
            <span className="text-stone text-xs">Confirmer ?</span>
            <button
              onClick={onConfirmDelete}
              disabled={deleting}
              className={`${actionClass} text-red-400 hover:text-red-500 border-red-400/40 disabled:opacity-50`}
            >
              {deleting ? "Suppression…" : "Oui, supprimer"}
            </button>
            <button
              onClick={onCancelDelete}
              className={`${actionClass} text-stone hover:text-ink`}
              style={{ borderColor: "var(--gold-border)" }}
            >
              Annuler
            </button>
          </>
        ) : (
          <button
            onClick={onAskDelete}
            className={`${actionClass} text-stone hover:text-red-400 hover:border-red-400/40`}
            style={{ borderColor: "var(--gold-border)" }}
          >
            Supprimer
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function MessagesPanel() {
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useContactMessages(page);

  const deleteMutation = useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-messages"] });
      setConfirmId(null);
    },
  });

  if (isLoading) return <PageSpinner />;

  if (!data?.messages.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl font-light italic text-stone mb-3">
          Aucun message
        </p>
        <p className="text-stone text-sm">
          Les demandes envoyées via le formulaire de contact apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-stone text-xs mb-6">
        {data.pagination.total} message{data.pagination.total > 1 ? "s" : ""} reçu
        {data.pagination.total > 1 ? "s" : ""}
      </p>

      <div className="space-y-4">
        {data.messages.map((m) => (
          <MessageCard
            key={m.id}
            message={m}
            confirming={confirmId === m.id}
            deleting={deleteMutation.isPending && confirmId === m.id}
            onAskDelete={() => setConfirmId(m.id)}
            onCancelDelete={() => setConfirmId(null)}
            onConfirmDelete={() => deleteMutation.mutate(m.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-stone text-xs">
            Page {data.pagination.page} sur {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
