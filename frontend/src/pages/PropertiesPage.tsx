import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import PropertyCard from "../components/ui/PropertyCard";
import FilterBar from "../components/ui/FilterBar";
import { PageSpinner } from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import { useProperties } from "../hooks/useProperties";
import { usePropertyTypes } from "../hooks/usePropertyTypes";
import type { PropertyFilters } from "../types";

export default function PropertiesPage() {
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 9,
  });

  const { data, isLoading, isFetching } = useProperties(filters);
  const { data: types = [] } = usePropertyTypes();

  const handleFilterChange = useCallback((next: PropertyFilters) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pagination = data?.pagination;

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-ink pt-32 pb-16">
        <div className="max-w-editorial mx-auto px-6 lg:px-16">
          <p className="text-label text-gold mb-4">Notre catalogue</p>
          <h1
            className="font-display font-light italic text-surface"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 0.96 }}
          >
            Propriétés
            <br />
            d'exception
          </h1>
          {pagination && (
            <p className="text-stone text-sm mt-6">
              {pagination.total} bien{pagination.total > 1 ? "s" : ""} disponible{pagination.total > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        types={types}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Results */}
      <div className="max-w-editorial mx-auto px-6 lg:px-16 py-12 lg:py-20">
        {isLoading ? (
          <PageSpinner />
        ) : !data?.properties.length ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl font-light italic text-stone mb-4">
              Aucun résultat
            </p>
            <p className="text-stone text-sm">
              Modifiez vos critères de recherche pour afficher des propriétés.
            </p>
          </div>
        ) : (
          <motion.div
            key={JSON.stringify(filters)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`transition-opacity duration-200 ${isFetching ? "opacity-60" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  variant="regular"
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => goToPage(pagination.page - 1)}
                >
                  ← Précédent
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-9 h-9 text-sm font-body transition-all duration-200 ${
                          page === pagination.page
                            ? "bg-gold text-ink"
                            : "text-stone hover:text-gold border border-transparent hover:border-gold/30"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => goToPage(pagination.page + 1)}
                >
                  Suivant →
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
