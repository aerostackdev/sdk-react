export interface DbQueryRequest {
  sql: string;
  params?: any[];
}

export interface DbQueryResponse {
  results: object[];
  count: number;
}