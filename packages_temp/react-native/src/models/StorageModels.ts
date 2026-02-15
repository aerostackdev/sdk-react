export interface StorageUploadRequest {
  file: any;
  key: string;
  contentType?: string;
}

export interface StorageUploadResponse {
  url: string;
}