import { PaginationOptions, PaginationResult } from '../interfaces/pagination.interface';

export function getPagination({ page = 1, take = 10 }: PaginationOptions): PaginationResult {
  page = Number(page);
  take = Number(take);
  const offset = (page - 1) * take;
  return {
    page,
    take,
    offset,
  };
}
