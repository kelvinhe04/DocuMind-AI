export interface ActivityPoint {
  date: string;
  count: number;
}

export interface Metrics {
  documents: number;
  chunks: number;
  queries: number;
  storage_mb: number;
  activity: ActivityPoint[];
}
