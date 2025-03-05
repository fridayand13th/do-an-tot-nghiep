export interface PaginationOptions {
  page?: number;
  take?: number;
}

export interface PaginationResult {
  page: number;
  take: number;
  offset: number;
}

export function getPagination({
  page = 1,
  take = 10,
}: PaginationOptions): PaginationResult {
  page = Number(page);
  take = Number(take);

  const offset = (page - 1) * take;

  return {
    page,
    take,
    offset,
  };
}

export function clearJsonString(jsonString: string): string {
  return jsonString.replace(/^```json\s*|\s*```[\s\n]*$/g, "");
}
