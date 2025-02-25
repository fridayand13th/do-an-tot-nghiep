export interface PaginatedResult<T> {
  items: T[];
  take: number;
  count: number;
  totalPage: number;
  currentPage: number;
}
