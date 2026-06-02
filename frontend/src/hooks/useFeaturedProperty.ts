import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProperty } from "../lib/api";

export function useFeaturedProperty() {
  return useQuery({
    queryKey: ["property-featured"],
    queryFn: fetchFeaturedProperty,
  });
}
