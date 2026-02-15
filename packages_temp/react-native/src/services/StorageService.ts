import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { StorageUploadRequest, StorageUploadResponse } from '../models/StorageModels';

export class StorageService {
  private apiClient: AxiosInstance;

  constructor(apiKey: string, baseUrl: string) {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-Aerostack-Key': apiKey
      }
    });
  }

  async upload(data: StorageUploadRequest): Promise<StorageUploadResponse> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('key', data.key);

    if (data.contentType) {
      formData.append('contentType', data.contentType);
    }

    const response = await this.apiClient.post('/storage/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    return response.data;
  }
}