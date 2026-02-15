export interface ServicesInvokeRequest {
  serviceName: string;
  data: Record<string, any>;
}

export interface ServicesInvokeResponse {
  success: boolean;
  result?: Record<string, any>;
}