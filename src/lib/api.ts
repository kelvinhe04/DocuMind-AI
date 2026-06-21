import axios from "axios";

// Cliente HTTP del frontend. Apunta al proxy de Next.js (/api/proxy),
// que reenvía a FastAPI y aplica el gating por plan. (El proxy se crea en la Fase 4.)
export const api = axios.create({
  baseURL: "/api/proxy",
  headers: { "Content-Type": "application/json" },
});
