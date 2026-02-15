import axios, { AxiosInstance } from 'axios';
import { QueueEnqueueRequest, QueueEnqueueResponse } from '../models/QueueModels';

export class QueueService {
  private apiClient: AxiosInstance;

  constructor(apiKey: string, baseUrl: string) {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-Aerostack-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async enqueue(data: QueueEnqueueRequest): Promise<QueueEnqueueResponse> {
    const response = await this.apiClient.post('/queue/enqueue', data);
    return response.data;
  }
}