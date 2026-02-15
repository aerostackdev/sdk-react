export interface QueueEnqueueRequest {
  type: string;
  data: Record<string, any>;
  delay?: number;
}

export interface QueueEnqueueResponse {
  jobId: string;
  success: boolean;
}