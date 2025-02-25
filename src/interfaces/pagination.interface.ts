export interface PaginationOptions {
  page?: number;
  take?: number;
}

export interface PaginationResult {
  page: number;
  take: number;
  offset: number;
}
