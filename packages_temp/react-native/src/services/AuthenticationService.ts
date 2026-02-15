import axios, { AxiosInstance } from 'axios';
import { AuthSignUpRequest, AuthSignInRequest, AuthResponse } from '../models/AuthenticationModels';

export class AuthenticationService {
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

  async signUp(data: AuthSignUpRequest): Promise<AuthResponse> {
    const response = await this.apiClient.post('/auth/signup', data);
    return response.data;
  }

  async signIn(data: AuthSignInRequest): Promise<AuthResponse> {
    const response = await this.apiClient.post('/auth/signin', data);
    return response.data;
  }
}