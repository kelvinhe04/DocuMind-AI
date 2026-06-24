"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { api } from "@/lib/api";
import type { Document } from "@/types/document";

let documentsCache: Document[] | null = null;
let documentsRequest: Promise<Document[]> | null = null;

async function loadDocuments(force = false) {
  if (!force && documentsCache) return documentsCache;
  if (!force && documentsRequest) return documentsRequest;

  documentsRequest = api
    .get("/documents")
    .then((res) => {
      const documents = res.data.documents ?? [];
      documentsCache = documents;
      return documents;
    })
    .finally(() => {
      documentsRequest = null;
    });

  return documentsRequest;
}

export function invalidateDocumentsCache() {
  documentsCache = null;
  documentsRequest = null;
}

export function useDocuments() {
  const { isLoaded, isSignedIn } = useUser();
  const [documents, setDocuments] = useState<Document[]>(documentsCache ?? []);
  const [loading, setLoading] = useState(!documentsCache);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (force = false, silent = false) => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      setError(null);
      try {
        setDocuments(await loadDocuments(force));
      } catch {
        setError("No se pudieron cargar los documentos.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [isLoaded, isSignedIn],
  );

  useEffect(() => {
    // Always force-refresh on mount; silent if we already have cached data
    fetch(true, !!documentsCache);
  }, [fetch]);

  const refresh = useCallback(() => fetch(true), [fetch]);

  return { documents, loading, error, refresh };
}
