import { useQuery } from "@tanstack/react-query";
import { fetchAgencies } from "../lib/api";

export function useAgencies() {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: fetchAgencies,
    staleTime: 1000 * 60 * 5,
  });
}
