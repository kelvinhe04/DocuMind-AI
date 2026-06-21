export interface Document {
  id: string;
  filename: string;
  source_type: "pdf_text" | "pdf_ocr" | "image_ocr";
  pages: number;
  chunks: number;
  status: "ready" | "processing" | "error";
  ocr_confidence?: number | null;
  uploaded_at: string;
}

export interface UploadResult {
  document_id: string;
  filename: string;
  source_type: string;
  pages: number;
  chunks: number;
  ocr_confidence?: number | null;
}
