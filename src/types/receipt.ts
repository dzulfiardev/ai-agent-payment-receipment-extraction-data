// Receipt data types based on the requirements specification
export interface ReceiptProduct {
  name: string;
  price: string;
  quantity: string;
  unitPrice?: string;
}

export interface ReceiptData {
  id: string;
  storeName?: string;
  address?: string;
  phone?: string;
  date?: string;
  currency?: string;
  totalItems?: number;
  totalDiscount?: string;
  items: ReceiptProduct[];
  total?: string;
  tax?: string;
  timestamp: string;
  fileName: string;
  // Legacy fields for backward compatibility
  products: ReceiptProduct[];
  total_spending: number;
  extraction_date: string;
  file_name: string;
}

export interface ExtractionState {
  isLoading: boolean;
  isProcessing: boolean;
  data: ReceiptData | null;
  currentExtraction: ReceiptData | null; // For the active extraction
  error: string | null;
  progress: number;
  history: ReceiptData[];
}

export interface ApiResponse {
  success: boolean;
  data?: ReceiptData;
  error?: string;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export interface FileUploadState {
  file: File | null;
  preview: string | null;
  isValid: boolean;
  errorMessage: string | null;
}

// Action payload types
export interface ExtractDataPayload {
  file: File;
  apiKey: string;
  country: string;
}

export interface ExtractionSuccess {
  data: ReceiptData;
  fileName: string;
}

export interface ExtractionError {
  error: string;
}