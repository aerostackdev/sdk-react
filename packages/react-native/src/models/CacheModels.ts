export interface CacheGetRequest {
  key: string;
}

export interface CacheGetResponse {
  value: any | null;
  exists: boolean;
}

export interface CacheSetRequest {
  key: string;
  value: any;
  ttl?: number;
}