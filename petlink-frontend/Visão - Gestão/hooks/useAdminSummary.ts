import { useCallback, useEffect, useState } from "react";
import { getAdminSummary } from "@/src/api/adminService";

type Summary = {
  funcionarios: number;
  veterinarios: number;
  usuarios: number;
  produtos: number;
  anuncios: number;
};

const INITIAL_SUMMARY: Summary = {
  funcionarios: 0,
  veterinarios: 0,
  usuarios: 0,
  produtos: 0,
  anuncios: 0,
};

export function useAdminSummary(token?: string | null) {
  const [summary, setSummary] = useState<Summary>(INITIAL_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminSummary(token || undefined);
      setSummary(data);
    } catch {
      setError("Não foi possível atualizar o resumo agora.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, error, refresh };
}
