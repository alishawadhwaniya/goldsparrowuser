export interface UploadResponse {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  cloudinaryUrl: string;
}


export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}
