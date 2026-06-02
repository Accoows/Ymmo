import { useQuery } from "@tanstack/react-query";
import { fetchContactMessages } from "../lib/api";

export function useContactMessages(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["contact-messages", { page, limit }],
    queryFn: () => fetchContactMessages(page, limit),
  });
}
