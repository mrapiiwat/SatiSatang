interface ElysiaErrorItem {
  type?: string | number;
  path?: string;
  message?: string;
  summary?: string;
  schema?: {
    error?: string;
  };
}

export interface ElysiaResponse {
  success: boolean;
  message: string;
  errors?: ElysiaErrorItem[];
}
