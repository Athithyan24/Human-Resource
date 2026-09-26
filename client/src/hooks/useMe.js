import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuth } from "../store/auth";

export function useMe() {
  const token = useAuth((s) => s.token);
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/auth/me")).data,
    enabled: Boolean(token),
  });
}
