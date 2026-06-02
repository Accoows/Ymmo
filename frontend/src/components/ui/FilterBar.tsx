import { useState, useCallback } from "react";
import type { PropertyType, PropertyFilters, PropertySort } from "../../types";

interface FilterBarProps {
  types: PropertyType[];
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
}

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];
const BATHROOM_OPTIONS = [1, 2, 3];
const GARAGE_OPTIONS = [1, 2, 3];

const SORT_OPTIONS: { value: PropertySort; label: string }[] = [
  { value: "recent", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "surface_desc", label: "Plus grande surface" },
];

const chipClass = (active: boolean) =>
  `text-[11px] font-body font-semibold uppercase tracking-[0.18em] px-4 py-2 border transition-all duration-200 ${
    active
      ? "bg-gold text-ink border-gold"
      : "border-gold/30 text-stone hover:border-gold hover:text-ink"
  }`;

type MinKey = "minBedrooms" | "minBathrooms" | "minGarage";

export default function FilterBar({
  types,
  filters,
  onFilterChange,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search ?? "");
  const [expanded, setExpanded] = useState(false);

  const update = useCallback(
    (patch: Partial<PropertyFilters>) => {
      onFilterChange({ ...filters, ...patch, page: 1 });
    },
    [filters, onFilterChange]
  );

  const handleType = useCallback(
    (type: string) => update({ type: filters.type === type ? "" : type }),
    [filters.type, update]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      update({ search: localSearch });
    },
    [localSearch, update]
  );

  const handleNumberChange = useCallback(
    (key: "minPrice" | "maxPrice" | "minSurface" | "maxSurface", value: string) => {
      update({ [key]: value ? Number(value) : undefined });
    },
    [update]
  );

  const toggleMin = useCallback(
    (key: MinKey, value: number) => {
      update({ [key]: filters[key] === value ? undefined : value });
    },
    [filters, update]
  );

  const activeCriteriaCount =
    (filters.minSurface ? 1 : 0) +
    (filters.maxSurface ? 1 : 0) +
    (filters.minBedrooms ? 1 : 0) +
    (filters.minBathrooms ? 1 : 0) +
    (filters.minGarage ? 1 : 0) +
    (filters.sort && filters.sort !== "recent" ? 1 : 0);

  const hasActiveFilters =
    !!filters.search ||
    !!filters.type ||
    !!filters.minPrice ||
    !!filters.maxPrice ||
    activeCriteriaCount > 0;

  const clearAll = () => {
    setLocalSearch("");
    setExpanded(false);
    onFilterChange({ page: 1 });
  };

  const renderMinChips = (
    label: string,
    options: number[],
    key: MinKey
  ) => (
    <div>
      <span className="text-label text-stone block mb-3">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleMin(key, opt)}
            className={chipClass(filters[key] === opt)}
            style={
              filters[key] !== opt
                ? { borderColor: "var(--gold-border)" }
                : undefined
            }
            aria-pressed={filters[key] === opt}
          >
            {opt}+
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="border-b" style={{ borderColor: "var(--gold-border)" }}>
      <div className="max-w-editorial mx-auto px-6 lg:px-16 py-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative max-w-lg">
            <input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Rechercher par nom, localisation ou description…"
              className="input-field pr-10 text-sm"
              aria-label="Rechercher des propriétés"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-gold transition-colors"
              aria-label="Lancer la recherche"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </form>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Type filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-label text-stone mr-1">Type</span>
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => handleType(t.name)}
                className={`text-[11px] font-body font-semibold uppercase tracking-[0.18em] px-4 py-2 border transition-all duration-200 ${
                  filters.type === t.name
                    ? "bg-gold text-ink border-gold"
                    : "border-gold/30 text-stone hover:border-gold hover:text-ink"
                }`}
                style={filters.type !== t.name ? { borderColor: "var(--gold-border)" } : undefined}
              >
                {t.name}
                <span className="ml-1.5 opacity-60">({t._count.properties})</span>
              </button>
            ))}
          </div>

          {/* Price range */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-label text-stone">Prix</span>
            <input
              type="number"
              placeholder="Min €"
              value={filters.minPrice ?? ""}
              onChange={(e) => handleNumberChange("minPrice", e.target.value)}
              className="input-field w-28 text-sm"
              min={0}
              step={50000}
            />
            <span className="text-stone">—</span>
            <input
              type="number"
              placeholder="Max €"
              value={filters.maxPrice ?? ""}
              onChange={(e) => handleNumberChange("maxPrice", e.target.value)}
              className="input-field w-28 text-sm"
              min={0}
              step={50000}
            />
          </div>
        </div>

        {/* Advanced criteria toggle */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-label text-stone hover:text-gold transition-colors"
            aria-expanded={expanded}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            Plus de critères
            {activeCriteriaCount > 0 && (
              <span className="bg-gold text-ink text-[10px] font-bold px-1.5 py-0.5 leading-none">
                {activeCriteriaCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-label text-stone hover:text-gold transition-colors ml-auto"
            >
              Effacer les filtres
            </button>
          )}
        </div>

        {/* Advanced criteria panel */}
        {expanded && (
          <div
            className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"
            style={{ borderColor: "var(--gold-border)" }}
          >
            {renderMinChips("Chambres", BEDROOM_OPTIONS, "minBedrooms")}
            {renderMinChips("Salles de bain", BATHROOM_OPTIONS, "minBathrooms")}
            {renderMinChips("Parking", GARAGE_OPTIONS, "minGarage")}

            {/* Surface range */}
            <div>
              <span className="text-label text-stone block mb-3">Surface (m²)</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minSurface ?? ""}
                  onChange={(e) => handleNumberChange("minSurface", e.target.value)}
                  className="input-field w-full text-sm"
                  min={0}
                  step={10}
                />
                <span className="text-stone">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxSurface ?? ""}
                  onChange={(e) => handleNumberChange("maxSurface", e.target.value)}
                  className="input-field w-full text-sm"
                  min={0}
                  step={10}
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <span className="text-label text-stone block mb-3">Trier par</span>
              <select
                value={filters.sort ?? "recent"}
                onChange={(e) =>
                  update({ sort: e.target.value as PropertySort })
                }
                className="input-field text-sm"
                aria-label="Trier les résultats"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
