import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { PageSpinner } from "../components/ui/Spinner";
import MessagesPanel from "../components/admin/MessagesPanel";
import { useAuth } from "../context/AuthContext";
import {
  fetchProperties,
  deleteProperty,
  createProperty,
  updateProperty,
} from "../lib/api";
import { usePropertyTypes } from "../hooks/usePropertyTypes";
import type { Property, CreatePropertyPayload } from "../types";

// ─── Property form modal ─────────────────────────────────────────────────────

interface PropertyFormData {
  name: string;
  description: string;
  typeId: string;
  localisation: string;
  price: string;
  surface: string;
  bedroom: string;
  bathroom: string;
  garage: string;
  photos: string;
  features: string;
  year: string;
}

const emptyForm: PropertyFormData = {
  name: "",
  description: "",
  typeId: "",
  localisation: "",
  price: "",
  surface: "",
  bedroom: "",
  bathroom: "",
  garage: "",
  photos: "",
  features: "",
  year: "",
};

function fromProperty(p: Property): PropertyFormData {
  return {
    name: p.title,
    description: p.description,
    typeId: String(p.typeId),
    localisation: p.location,
    price: String(p.priceRaw),
    surface: String(p.surface),
    bedroom: String(p.bedrooms),
    bathroom: String(p.bathrooms),
    garage: String(p.parking),
    photos: p.gallery.join("\n"),
    features: p.features.join("\n"),
    year: p.year ? String(p.year) : "",
  };
}

function toPayload(form: PropertyFormData): CreatePropertyPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    typeId: Number(form.typeId),
    localisation: form.localisation.trim(),
    price: Number(form.price),
    surface: Number(form.surface),
    bedroom: Number(form.bedroom),
    bathroom: Number(form.bathroom),
    garage: Number(form.garage),
    photos: form.photos
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    details: {
      features: form.features
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      ...(form.year ? { year: Number(form.year) } : {}),
    },
  };
}

interface PropertyModalProps {
  editTarget: Property | null;
  onClose: () => void;
}

function PropertyModal({ editTarget, onClose }: PropertyModalProps) {
  const [form, setForm] = useState<PropertyFormData>(
    editTarget ? fromProperty(editTarget) : emptyForm
  );
  const [formError, setFormError] = useState("");
  const qc = useQueryClient();
  const { data: types = [] } = usePropertyTypes();

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      onClose();
    },
    onError: () => setFormError("Erreur lors de la création."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePropertyPayload> }) =>
      updateProperty(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      onClose();
    },
    onError: () => setFormError("Erreur lors de la mise à jour."),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const payload = toPayload(form);
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const inputClass = "input-field text-sm";
  const labelClass = "text-label text-stone block mb-1.5";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-parchment"
        style={{ border: "1px solid var(--gold-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-5 border-b bg-ink"
          style={{ borderColor: "var(--gold-border)" }}
        >
          <h2 className="font-display text-xl font-medium italic text-surface">
            {editTarget ? "Modifier la propriété" : "Nouvelle propriété"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone hover:text-gold transition-colors"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label htmlFor="f-name" className={labelClass}>Titre *</label>
              <input id="f-name" name="name" required value={form.name} onChange={handleChange} className={inputClass} placeholder="Villa d'exception..." />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="f-desc" className={labelClass}>Description *</label>
              <textarea id="f-desc" name="description" required rows={4} value={form.description} onChange={handleChange} className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label htmlFor="f-type" className={labelClass}>Type *</label>
              <select id="f-type" name="typeId" required value={form.typeId} onChange={handleChange} className={inputClass}>
                <option value="">Sélectionner…</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="f-loc" className={labelClass}>Localisation *</label>
              <input id="f-loc" name="localisation" required value={form.localisation} onChange={handleChange} className={inputClass} placeholder="Paris 16ème" />
            </div>

            <div>
              <label htmlFor="f-price" className={labelClass}>Prix (€) *</label>
              <input id="f-price" name="price" type="number" required min={0} value={form.price} onChange={handleChange} className={inputClass} placeholder="2500000" />
            </div>

            <div>
              <label htmlFor="f-surface" className={labelClass}>Surface (m²) *</label>
              <input id="f-surface" name="surface" type="number" required min={1} value={form.surface} onChange={handleChange} className={inputClass} placeholder="250" />
            </div>

            <div>
              <label htmlFor="f-bed" className={labelClass}>Chambres *</label>
              <input id="f-bed" name="bedroom" type="number" required min={0} value={form.bedroom} onChange={handleChange} className={inputClass} placeholder="4" />
            </div>

            <div>
              <label htmlFor="f-bath" className={labelClass}>Salles de bain *</label>
              <input id="f-bath" name="bathroom" type="number" required min={0} value={form.bathroom} onChange={handleChange} className={inputClass} placeholder="3" />
            </div>

            <div>
              <label htmlFor="f-garage" className={labelClass}>Garages</label>
              <input id="f-garage" name="garage" type="number" min={0} value={form.garage} onChange={handleChange} className={inputClass} placeholder="2" />
            </div>

            <div>
              <label htmlFor="f-year" className={labelClass}>Année</label>
              <input id="f-year" name="year" type="number" value={form.year} onChange={handleChange} className={inputClass} placeholder="2023" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="f-photos" className={labelClass}>Photos (une URL par ligne)</label>
              <textarea id="f-photos" name="photos" rows={4} value={form.photos} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="https://images.unsplash.com/..." />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="f-feat" className={labelClass}>Prestations (une par ligne)</label>
              <textarea id="f-feat" name="features" rows={4} value={form.features} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Piscine à débordement&#10;Vue mer panoramique" />
            </div>
          </div>

          {formError && (
            <p className="mt-4 text-red-500 text-xs">{formError}</p>
          )}

          <div className="mt-8 flex gap-4">
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Enregistrement…" : editTarget ? "Enregistrer les modifications" : "Créer la propriété"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

type AdminTab = "properties" | "messages";

export default function AdminPage() {
  const { isAuthenticated, canManage, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("properties");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Property | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["properties", { page, limit: 15 }],
    queryFn: () => fetchProperties({ page, limit: 15 }),
    enabled: tab === "properties",
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      setDeleteConfirm(null);
    },
  });

  if (authLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canManage) {
    return (
      <Layout>
        <div className="pt-32 pb-20 max-w-editorial mx-auto px-6 lg:px-16 text-center">
          <p className="font-display text-3xl font-light italic text-stone">
            Accès non autorisé
          </p>
        </div>
      </Layout>
    );
  }

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (property: Property) => {
    setEditTarget(property);
    setModalOpen(true);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-ink pt-28">
        <div className="max-w-editorial mx-auto px-6 lg:px-16">
          <div className="flex items-end justify-between pb-8">
            <div>
              <p className="text-label text-gold mb-3">Espace administration</p>
              <h1
                className="font-display font-light italic text-surface"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                {tab === "properties" ? "Gestion des propriétés" : "Messages clients"}
              </h1>
            </div>
            {tab === "properties" && (
              <Button variant="primary" size="md" onClick={openCreate}>
                + Nouvelle propriété
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-8">
            {([
              { id: "properties", label: "Propriétés" },
              { id: "messages", label: "Messages" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-4 text-label border-b-2 transition-colors ${
                  tab === t.id
                    ? "text-gold border-gold"
                    : "text-stone border-transparent hover:text-surface"
                }`}
                aria-current={tab === t.id ? "page" : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-editorial mx-auto px-6 lg:px-16 py-10">
        {tab === "messages" ? (
          <MessagesPanel />
        ) : isLoading ? (
          <PageSpinner />
        ) : !data?.properties.length ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl font-light italic text-stone mb-4">
              Aucune propriété
            </p>
            <Button variant="ghost" onClick={openCreate}>
              Créer la première propriété
            </Button>
          </div>
        ) : (
          <div className="border" style={{ borderColor: "var(--gold-border)" }}>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th className="hidden md:table-cell">Localisation</th>
                    <th>Prix</th>
                    <th className="hidden lg:table-cell">Surface</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.properties.map((property) => (
                    <tr key={property.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {property.image && (
                            <img
                              src={property.image}
                              alt=""
                              className="w-10 h-10 object-cover flex-shrink-0"
                            />
                          )}
                          <span className="font-medium text-sm line-clamp-1">
                            {property.title}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="stone">{property.type}</Badge>
                      </td>
                      <td className="hidden md:table-cell text-stone">
                        {property.location}
                      </td>
                      <td className="text-price font-semibold whitespace-nowrap">
                        {property.price}
                      </td>
                      <td className="hidden lg:table-cell text-stone">
                        {property.surface} m²
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(property)}
                            className="text-label text-stone hover:text-gold transition-colors px-3 py-1.5 border hover:border-gold/40"
                            style={{ borderColor: "var(--gold-border)" }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(property.id)}
                            className="text-label text-stone hover:text-red-400 transition-colors px-3 py-1.5 border hover:border-red-400/40"
                            style={{ borderColor: "var(--gold-border)" }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div
                className="flex items-center justify-between px-6 py-4 border-t"
                style={{ borderColor: "var(--gold-border)" }}
              >
                <p className="text-stone text-xs">
                  Page {data.pagination.page} sur {data.pagination.totalPages} —{" "}
                  {data.pagination.total} propriétés
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
        )}
      </div>

      {/* Property modal */}
      <AnimatePresence>
        {modalOpen && (
          <PropertyModal
            editTarget={editTarget}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-parchment p-8 max-w-sm w-full"
              style={{ border: "1px solid var(--gold-border)" }}
            >
              <h3 className="font-display text-2xl font-medium text-ink mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-stone text-sm mb-8">
                Cette action est irréversible. La propriété et toutes ses photos
                seront définitivement supprimées.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="primary"
                  onClick={() => deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {deleteMutation.isPending ? "Suppression…" : "Supprimer"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Annuler
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
