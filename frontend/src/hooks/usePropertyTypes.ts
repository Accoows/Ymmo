import { useQuery } from "@tanstack/react-query";
import { fetchPropertyTypes } from "../lib/api";

export function usePropertyTypes() {
  return useQuery({
    queryKey: ["property-types"],
    queryFn: fetchPropertyTypes,
    staleTime: Infinity,
  });
}
