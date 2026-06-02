import { useQuery } from "@tanstack/react-query";
import { fetchProperties } from "../lib/api";
import type { PropertyFilters } from "../types";

export function useProperties(filters: PropertyFilters = {}) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => fetchProperties(filters),
  });
}
