import { useQuery } from "@tanstack/react-query";
import { fetchPropertyLocations } from "../lib/api";

export function usePropertyLocations() {
  return useQuery({
    queryKey: ["property-locations"],
    queryFn: fetchPropertyLocations,
    staleTime: 1000 * 60 * 5,
  });
}
