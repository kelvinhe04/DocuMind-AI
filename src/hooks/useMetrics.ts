"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { api } from "@/lib/api";
import type { Metrics } from "@/types/metrics";

let metricsCache: Metrics | null = null;
let metricsRequest: Promise<Metrics> | null = null;

async function loadMetrics(force = false) {
  if (!force && metricsCache) return metricsCache;
  if (!force && metricsRequest) return metricsRequest;

  metricsRequest = api
    .get<Metrics>("/metrics")
    .then((res) => {
      const metrics = res.data;
      metricsCache = metrics;
      return metrics;
    })
    .finally(() => {
      metricsRequest = null;
    });

  return metricsRequest;
}

export function useMetrics() {
  const { isLoaded, isSignedIn } = useUser();
  const [metrics, setMetrics] = useState<Metrics | null>(metricsCache);
  const [loading, setLoading] = useState(!metricsCache);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (force = false) => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        setMetrics(await loadMetrics(force));
      } catch {
        setError("No se pudieron cargar las metricas.");
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, isSignedIn],
  );

  useEffect(() => {
    fetch(false);
    const id = setInterval(() => fetch(true), 30_000);
    return () => clearInterval(id);
  }, [fetch]);

  return { metrics, loading, error, refresh: fetch };
}
