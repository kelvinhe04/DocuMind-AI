"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Metrics } from "@/types/metrics";

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Metrics>("/metrics");
      setMetrics(res.data);
    } catch {
      setError("No se pudieron cargar las métricas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { metrics, loading, error, refresh: fetch };
}
